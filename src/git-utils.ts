// Git-related functions
import { $ } from './sh';

export type StagedChange = {
  title: string;
  paths: string[];
};

function formatStatus(status: string): string {
  if (status.startsWith('R')) return 'renamed';
  if (status === 'A') return 'added';
  if (status === 'D') return 'deleted';
  if (status === 'M') return 'modified';
  if (status === 'T') return 'type changed';
  return status;
}

function uniquePaths(changes: StagedChange[]): string[] {
  return [...new Set(changes.flatMap((change) => change.paths))];
}

// list staged file changes
export async function getStagedChanges(): Promise<StagedChange[]> {
  const res = await $`git diff --cached --name-status --find-renames -z`.quiet();
  const fields = res.stdout.toString().split('\0').filter(Boolean);

  const changes: StagedChange[] = [];

  for (let index = 0; index < fields.length;) {
    const status = fields[index++];

    if (status.startsWith('R')) {
      const oldFilePath = fields[index++];
      const newFilePath = fields[index++];

      changes.push({
        title: `renamed: ${oldFilePath} → ${newFilePath}`,
        paths: [oldFilePath, newFilePath],
      });

      continue;
    }

    const filePath = fields[index++];

    changes.push({
      title: `${formatStatus(status)}: ${filePath}`,
      paths: [filePath],
    });
  }

  return changes;
}

// diff only for selected staged file changes
export async function getStagedDiffForChanges(changes: StagedChange[]): Promise<string> {
  const paths = uniquePaths(changes);

  if (!paths.length) return '';

  const res = await $`git diff --cached --find-renames -- ${paths}`.quiet();

  return res.stdout.toString();
}

// commit only selected file changes with a message
export async function commitWithMessageForChanges(message: string, changes: StagedChange[]) {
  const paths = uniquePaths(changes);

  console.log(`\n📦 Committing ${changes.length} staged change(s): "${message}"`);

  await $`git commit -m ${message} -- ${paths}`.quiet();
}