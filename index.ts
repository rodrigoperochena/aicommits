#!/usr/bin/env bun
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Force .env load from THIS tool's folder, not where it's run from
dotenv.config({ path: path.resolve(__dirname, '.env') })

import { Command } from 'commander'
import prompts from 'prompts'
import { getAICommitMessage, explainDiff } from './ai-utils'
import { getStagedFiles, getStagedDiffForFiles, commitWithMessageForFiles } from './git-utils'

const program = new Command()

program
  .name('deep-commits')
  .description('Generate Git commit messages using DeepSeek')
  .version('0.2.0');

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
  .command('commit')
  .description('Generate an AI-powered commit message and commit it')
  .action(async () => {
    let remaining = await getStagedFiles()
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
        choices: remaining.map(f => ({ title: f, value: f })),
        instructions: false,
        hint: 'Space to select • Enter to confirm'
      })

      if (!picked || picked.length === 0) {
        console.log('❌ No files selected. Exiting.')
        process.exit(0);
      }

      // 2) Build a diff *only* for selected files
      console.log('🔍 Analyzing staged changes...')
      const diff = await getStagedDiffForFiles(picked);
      if (!diff.trim()) {
        console.log('⚠️ Selected files produced an empty diff. Try different files.');
        remaining = await getStagedFiles();
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
      await commitWithMessageForFiles(finalMessage, picked)

      // Refresh remaining staged files and offer another round
      remaining = await getStagedFiles();
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
    const files = await getStagedFiles();
    if (!files.length) {
      console.log('⚠️ No staged changes found.');
      process.exit(0);
    }

    const { picked } = await prompts({
      type: 'multiselect',
      name: 'picked',
      message: `Select files to explain (${files.length} staged total)`,
      choices: files.map(f => ({ title: f, value: f })),
      instructions: false,
      hint: 'Space to select • Enter to confirm'
    });

    const target = (picked && picked.length) ? picked : files;
    const diff = await getStagedDiffForFiles(target);
    if (!diff.trim()) {
      console.log('⚠️ Empty diff.');
      process.exit(0);
    }

    const explanation = await explainDiff(diff);
    console.log(`\n🧾 AI Explanation:\n${explanation}\n`);
  })

program.parse();