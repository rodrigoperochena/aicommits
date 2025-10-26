# @taksumaq/aicommits

**Tiny AI-powered Git commit assistant (~10 kB on npm).**
Generates commit messages (and explanations) for your **staged changes** using the DeepSeek API.

[![npm](https://img.shields.io/npm/v/%40taksumaq%2Faicommits?color=blue)](https://www.npmjs.com/package/@taksumaq/aicommits)

---

## Why this CLI?
- **Lightweight:** ~**10.7 kB** unpacked on npm.
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

## Configure (one-time)
Save your API key (DeepSeek) to your user config:
```bash
aicommits config set DEEPSEEK_API_KEY=sk-your-key
```
Useful extras:
```bash
aicommits config path                  # see where the config lives
aicommits config get DEEPSEEK_API_KEY  # print the stored value
```
Prefer an env var for a one-off shell?
```bash
export DEEPSEEK_API_KEY=sk-override-for-this-shell
```

---

## Use
Stage changes, then run:
```bash
git add <files...>
aicommits            # defaults to 'commit' flow
```
Short aliases also work: `aicommit`, `aicmt`, `aic`.

What you’ll see:
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
- Checklist of **staged** files → pick one or many.
- AI suggests a message → **use** / **edit** / **cancel**.
- It commits exactly those files with that message.
- If other files remain staged, it offers another round.

Explain instead:
```bash
aicommits explain
```

---

## License
MIT
