# CLAUDE.md — obsidian-inbox-notes

Obsidian plugin for device-specific inbox notes.

## Tech Stack

- TypeScript, esbuild
- Obsidian API

## Architecture

- Main class extends `Plugin`
- Device-specific inbox note routing
- Settings interface + settings tab

## Commands

```bash
npm install
npm run build   # Production build → main.js
npm run dev     # Watch mode
```

## Build Output

- `main.js` — plugin code (gitignored)
- `manifest.json` — plugin metadata

## Deployment

After committing, copy built files to vault:

```bash
cp main.js manifest.json \
  ~/Obsidian/Codex/.obsidian/plugins/obsidian-inbox-notes/
```

Then reload Obsidian (Cmd+Option+I to open console and check for errors).

## Git

Identity: personal (`jani@laatunen.fi` / janilaatunen)

## Rules

- Never increment version numbers without explicit confirmation
- "Vibe coded" — focus on functionality over perfect code quality
- Always recommend users backup their vault before using
