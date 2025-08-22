# deep-commits

**AI-powered Git commit assistant.**
Generate commit messages and explanations for your staged changes using the [DeepSeek](https://platform.deepseek.com/) API.
Built with [Bun](https://bun.sh/).

---

## ✨ Features

* Generates commit messages for **staged changes** (scoped to files you select).
* Interactive multiselect: pick one, many, or all staged files.
* Lets you **accept, edit, or cancel** AI-generated messages.
* Additional command to **explain staged changes** in plain English.
* Uses `.env` (in the tool directory) for API key loading.
* Quiet execution — no raw diffs spamming your console.

---

## 📦 Installation

Clone and install:

```bash
git clone https://github.com/rodrigoperochena/deep-commits.git
cd deep-commits
bun install
bun link   # makes `deep-commits` available globally
```

---

## 🔐 Configuration

Create a `.env` file **in the project folder**:

```env
DEEPSEEK_API_KEY=your_api_key_here
```

> ℹ️ The CLI always loads `.env` from its own directory (`index.ts` enforces this), so the key will be found no matter where you run the command.

---

## 🚀 Usage

Stage your changes:

```bash
git add .
```

### Generate a commit

```bash
deep-commits commit
```

* CLI shows a checklist of staged files.
* Select one (or several) → AI generates a commit message just for those.
* You can **accept**, **edit**, or **cancel**.
* The files are committed with that message.
* If more files remain staged, you’ll be asked whether to commit another subset.

Example flow:

```
Select files to include in this commit (3 staged total)
 ◯ src/index.ts
 ◉ src/utils/env.ts
 ◯ src/git-utils.ts

🧠 Suggested commit message:
"fix(env): validate DEEPSEEK_API_KEY before use"

? What do you want to do?
> ✅ Use this message and commit
  📝 Edit message before committing
  ❌ Cancel

📦 Committing 1 file(s): "fix(env): validate DEEPSEEK_API_KEY before use"
```

### Explain staged changes

```bash
deep-commits explain
```

* CLI shows a checklist of staged files (or you can press Enter to explain all).
* AI prints a natural-language explanation of what changed.

Example:

```
🧾 AI Explanation:
- Added API key validation in utils/env.ts
- Updated commit command to handle multiselect staged files
```

---

## 🛠️ Project structure

```
index.ts        # CLI entry (commands, prompts, env load)
ai-utils.ts     # DeepSeek API calls (commit message + explanation)
git-utils.ts    # Git helpers (list staged files, diff per file, commit subset)
utils/env.ts    # API key handling
package.json    # Bun CLI config
bunfig.toml     # Bun config
```

---

## 📄 License

MIT

---

⚡ **deep-commits** helps you write cleaner commits and understand your changes faster — with AI woven directly into your Git workflow.