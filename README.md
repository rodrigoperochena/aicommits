# @taksumaq/aicommits

**Tiny AI-powered Git commit assistant**
Generates commit messages (and explanations) for your **staged changes** using the DeepSeek API.

[![npm](https://img.shields.io/npm/v/%40taksumaq%2Faicommits?color=blue)](https://www.npmjs.com/package/@taksumaq/aicommits)

---

## Why this CLI?
- **Lightweight**
- **Zero-friction UX:** `aicommits` (no subcommand) runs the default **commit** flow.
- **Focused messages:** scope to the staged files you select.
- **Explain mode:** `aicommits explain` summarizes what changed.
- **One-time setup:** stores config at `~/.config/aicommits/config.json` (or `$XDG_CONFIG_HOME/...`).

---

## Install
```bash
npm i -g @taksumaq/aicommits
```
> Requires Node.js 18+. Check with `node --version`.

---

## Configure
Save your API key (DeepSeek) to your user config:
```bash
aicommits config set DEEPSEEK_API_KEY=sk-your-key
```

---

## Usage
Stage changes, then run:
```bash
git add <files...>
aicommits
```
Short aliases also work: `aicommit`, `aicmt`, `aic`.

Example of what you’ll see:
```
? Select files to include in this commit (3 staged total) › Space to select • Enter to confirm
 ◯ README.md
 ◉ package.json
 ◯ src/index.ts

🧠 Suggested commit message:
"Update package.json metadata and dependencies"

- Add description, keywords, author, and publish config
- Remove dotenv dependency and external build reference
- Reorganize fields for better readability
- Specify package manager as bun@1.3.0"

? What do you want to do?
> ✅ Use this message and commit
  📝 Edit message before committing
  ❌ Cancel

📦 Committing 1 file(s): ""Update package.json metadata and dependencies"
```
- Checklist of **staged** files → pick one or many.
- AI suggests a message → **use** / **edit** / **cancel**.
- It commits exactly those files with that message.
- If other files remain staged, it offers another round.

Explain instead:
```bash
aicommits explain
```

---
## Update  
Check installed version:
```bash
aicommits --version
``` 

If not the [latest version](https://github.com/rodrigoperochena/aicommits/releases/latest) run:
```bash 
npm update -g @taksumaq/aicommits
```
---

### Useful extras:
```bash
aicommits config path                  # see where the config lives
aicommits config get DEEPSEEK_API_KEY  # print the stored value
```
Prefer an env var for a one-off shell?
```bash
export DEEPSEEK_API_KEY=sk-override-for-this-shell
```

---

## License
MIT
