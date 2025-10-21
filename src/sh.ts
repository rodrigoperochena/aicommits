// src/sh.ts — Node-compatible shim for Bun’s `$` tagged template
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

type DollarResult = { stdout: string; stderr: string; exitCode: number }
type DollarPromise = Promise<DollarResult> & {
  quiet(): DollarPromise
  nothrow(): DollarPromise
}

function splitTokens(s: string): string[] {
  // naive whitespace split is enough for our git use; avoid shell parsing
  return s.trim().split(/\s+/).filter(Boolean)
}

function toArgList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(x => String(x))
  return [String(v)]
}

export function $(
  strings: TemplateStringsArray,
  ...values: unknown[]
): DollarPromise {
  // build argv tokens from template + interpolations (arrays are expanded)
  const tokens: string[] = []
  for (let i = 0; i < strings.length; i++) {
    tokens.push(...splitTokens(strings[i]))
    if (i < values.length) tokens.push(...toArgList(values[i]))
  }

  if (tokens.length === 0) throw new Error('Empty command')
  const cmd = tokens[0]
  const args = tokens.slice(1)

  let suppressThrow = false
  // quiet flag exists for API compatibility; we don’t echo anyway
  const run = async (): Promise<DollarResult> => {
    try {
      const { stdout, stderr } = await execFileAsync(cmd, args, {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 50, // 50MB for big diffs
      })
      return { stdout, stderr, exitCode: 0 }
    } catch (err: any) {
      const res: DollarResult = {
        stdout: err?.stdout?.toString?.() ?? '',
        stderr: err?.stderr?.toString?.() ?? String(err?.message ?? ''),
        exitCode: typeof err?.code === 'number' ? err.code : 1,
      }
      if (!suppressThrow && res.exitCode !== 0) {
        const e = new Error(res.stderr || `Command failed: ${cmd}`)
        ;(e as any).result = res
        throw e
      }
      return res
    }
  }

  const p = run() as DollarPromise
  p.quiet = () => p                   // API compat (no-op)
  p.nothrow = () => { suppressThrow = true; return p }
  return p
}