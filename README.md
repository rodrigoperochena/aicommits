# @taksumaq/aicommits

**AI-powered Git commit assistant.**
Generate commit messages and explanations for your staged changes using the [DeepSeek](https://platform.deepseek.com/) API.
Built with [Bun](https://bun.sh/).

[![npm version](https://img.shields.io/npm/v/%40taksumaq%2Faicommits.svg?color=blue)](https://www.npmjs.com/package/@taksumaq/aicommits)
---

## ✨ Features

* Generates commit messages for **staged changes** (scoped to files you select).
* Interactive multiselect: pick one, many, or all staged files.
* Lets you **accept, edit, or cancel** AI-generated messages.
* Additional command to **explain staged changes** in plain English.
* Stores config per user at `~/.config/aicommits/config.json` (or `$XDG_CONFIG_HOME/aicommits/config.json`).
* Works globally after install; no per-project setup needed.

---

## 📦 Install

```bash
npm i -g @taksumaq/aicommits
```

> Requires Node.js 18+. Check your version with `node --version`

---

## 🔐 Configure your API key:

```bash
# save your key to your user config so aicommits can use it
aicommits config set DEEPSEEK_API_KEY=sk-your-key
```
> aicommits loads this config on startup. You can see where it's stored by running  `aicommits config path` and read its value by running `aicommits config get DEEPSEEK_API_KEY`. You can also set `DEEPSEEK_API_KEY` with an environment variable if you want to override it. 👇🏼

```bash
export DEEPSEEK_API_KEY=sk-override-for-this-shell
```

## 🚀 Usage

Stage some changes:

```bash
git add <files...>
aicommits
```
> **Tip**: You can use shorter aliases like `aicommit`, `aicmt` or `aic`.

* CLI shows a checklist of staged files.
* Select one (or several) → AI generates a commit message just for those.
* You can **accept**, **edit**, or **cancel**.
* The files are committed with that message.
* If more files remain staged, you’ll be asked whether to commit another subset.

Example flow:

```
? Select files to include in this commit (1 staged total) › Space to select • Enter to confirm
 ◉ README.md

🧠 Suggested commit message:
"Update README with new installation, config, and usage instructions"

? What do you want to do?
> ✅ Use this message and commit
  📝 Edit message before committing
  ❌ Cancel

📦 Committing 1 file(s): "Update README with new installation, config, and usage instructions"
```

---

## 📄 License

MIT

---

⚡ **deep-commits** helps you write cleaner commits and understand your changes faster — with AI woven directly into your Git workflow.