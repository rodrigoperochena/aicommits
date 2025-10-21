// src/config.ts
import os from 'node:os'
import path from 'node:path'
import { promises as fsp, existsSync, readFileSync } from 'node:fs'

const APP_DIR = 'aicommits'

export function configDir(): string {
  const base = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
  return path.join(base, APP_DIR)
}

export function configPath(): string {
  return path.join(configDir(), 'config.json')
}

// Load config (sync) and copy keys into process.env if not already set.
// Sync keeps startup simple and avoids top-level await.
export function loadConfigIntoEnv(): void {
  const p = configPath()
  if (!existsSync(p)) return
  try {
    const json = JSON.parse(readFileSync(p, 'utf8')) as Record<string, string>
    for (const [k, v] of Object.entries(json)) {
      if (!process.env[k]) process.env[k] = v
    }
  } catch {}
}

export async function setKey(key: string, value: string): Promise<void> {
  await fsp.mkdir(configDir(), { recursive: true })
  let data: Record<string, string> = {}
  try {
    const raw = await fsp.readFile(configPath(), 'utf8')
    data = JSON.parse(raw)
  } catch {}
  data[key] = value
  await fsp.writeFile(configPath(), JSON.stringify(data, null, 2), 'utf8')
}

export async function getKey(key: string): Promise<string | undefined> {
  try {
    const raw = await fsp.readFile(configPath(), 'utf8')
    const data = JSON.parse(raw) as Record<string, string>
    return data[key]
  } catch {
    return undefined
  }
}