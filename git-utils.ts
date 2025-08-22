// Git-related functions
import { $ } from 'bun';

//list staged files */
export async function getStagedFiles(): Promise<string[]> {
  const res = await $`git diff --cached --name-only`.quiet();
  return res.stdout.toString().trim().split("\n").filter(Boolean);
}

//diff only for selected staged files */
export async function getStagedDiffForFiles(files: string[]): Promise<string> {
  if (!files.length) return "";
  // Bun’s `$` expands arrays safely as multiple args
  const res = await $`git diff --cached -- ${files}`.quiet();
  return res.stdout.toString();
}

//commit only selected files with a message */
export async function commitWithMessageForFiles(message: string, files: string[]) {
  console.log(`\n📦 Committing ${files.length} file(s): "${message}"`);
  await $`git commit -m ${message} -- ${files}`.quiet();
}