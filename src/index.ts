// imports & config
import { loadConfigIntoEnv, setKey, getKey, configPath } from './config'
loadConfigIntoEnv() // fills process.env from ~/.config/aicommits/config.json if present

import { Command } from 'commander'
import prompts from 'prompts'
import { getAICommitMessage, explainDiff } from './ai-utils'
import { getStagedChanges, getStagedDiffForChanges, commitWithMessageForChanges } from './git-utils'

// read version from package.json (so --version always matches)
declare const require: any;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json') as { version: string };

// CLI
const program = new Command()

program
  .name('aicommits')
  .description('Generate Git commit messages using DeepSeek AI')
  .version(version);

async function maybeEdit(initial: string): Promise<string | null> {
  console.log(`\n🧠 Suggested commit message:\n"${initial}"\n`);
  const { action } = await prompts({
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { title: '✅ Use this message and commit', value: 'use' },
      { title: '📝 Edit message before committing', value: 'edit' },
      { title: '❌ Cancel', value: 'cancel' }
    ],
    initial: 0
  });

  if (action === 'cancel') return null;

  if (action === 'edit') {
    const { edited } = await prompts({
      type: 'text',
      name: 'edited',
      message: 'Edit commit message:',
      initial
    });
    const msg = (edited ?? '').trim();
    return msg.length ? msg : null;
  }

  return initial;
}

program
  .command('commit', { isDefault: true }) // default if no subcommand is given
  .description('Generate an AI-powered commit message and commit it')
  .action(async () => {
    let remaining = await getStagedChanges()
    if (!remaining.length) {
      console.log('⚠️ No staged changes found. Use `git add` first.')
      process.exit(0);
    }

    while (remaining.length) {
      // 1) Let user select staged files to include
      const { picked } = await prompts({
        type: 'multiselect',
        name: 'picked',
        message: `Select files to include in this commit (${remaining.length} staged total)`,
        choices: remaining.map((change) => ({ title: change.title, value: change })),
        instructions: false,
        hint: 'Space to select • Enter to confirm'
      })

      if (!picked || picked.length === 0) {
        console.log('❌ No files selected. Exiting.')
        process.exit(0);
      }

      // 2) Build a diff *only* for selected files
      console.log('🔍 Analyzing staged changes...')
      const diff = await getStagedDiffForChanges(picked);
      if (!diff.trim()) {
        console.log('⚠️ Selected files produced an empty diff. Try different files.');
        remaining = await getStagedChanges();
        continue;
      }

      // 3) Ask AI for a message for *that* subset
      const aiMessage = await getAICommitMessage(diff);
      // 4) Confirm/edit
      const finalMessage = await maybeEdit(aiMessage);

      if (!finalMessage) {
        console.log('🛑 Cancelled.');
        process.exit(0);
      }

      // 5) Commit exactly those files with that message
      await commitWithMessageForChanges(finalMessage, picked)

      // Refresh remaining staged files and offer another round
      remaining = await getStagedChanges();
      if (!remaining.length) {
        console.log('✅ All staged changes have been committed.');
        break;
      }

      const { again } = await prompts({
        type: 'toggle',
        name: 'again',
        message: `There are still ${remaining.length} staged file(s). Commit another subset?`,
        initial: true,
        active: 'Yes',
        inactive: 'No'
      })

      if (!again) {
        console.log('👋 Done.');
        break;
      }
    }
  })

program
  .command('explain')
  .description('Explain the staged changes using AI (pick files)')
  .action(async () => {
    const files = await getStagedChanges();
    if (!files.length) {
      console.log('⚠️ No staged changes found.');
      process.exit(0);
    }

    const { picked } = await prompts({
      type: 'multiselect',
      name: 'picked',
      message: `Select files to explain (${files.length} staged total)`,
      choices: files.map((change) => ({ title: change.title, value: change })),
      instructions: false,
      hint: 'Space to select • Enter to confirm'
    });

    console.log('🔍 Analyzing staged changes...')
    const target = (picked && picked.length) ? picked : files;
    const diff = await getStagedDiffForChanges(target);
    if (!diff.trim()) {
      console.log('⚠️ Empty diff.');
      process.exit(0);
    }

    const explanation = await explainDiff(diff);
    console.log(`\n🧾 AI Explanation:\n${explanation}\n`);
  })

program
  .command('config')
  .description('Manage aicommits config')
  .argument('<action>', 'set|get|path')
  .argument('[pairOrKey]', 'KEY=VALUE for set, or KEY for get')
  .action(async (action, pairOrKey) => {
    if (action === 'path') {
      console.log(configPath())
      return
    }
    if (action === 'set') {
      if (!pairOrKey || !pairOrKey.includes('=')) {
        console.error('Usage: aicommits config set KEY=VALUE')
        process.exit(1)
      }
      const [key, ...rest] = pairOrKey.split('=')
      const value = rest.join('=')
      await setKey(key, value)
      console.log(`Saved ${key} to ${configPath()}`)
      return
    }
    if (action === 'get') {
      if (!pairOrKey) {
        console.error('Usage: aicommits config get KEY')
        process.exit(1)
      }
      const v = await getKey(pairOrKey)
      console.log(v ?? '')
      return
    }
    console.error('Unknown action. Use: set|get|path')
    process.exit(1)
  })

program.parse();