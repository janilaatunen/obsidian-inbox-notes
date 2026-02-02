# Inbox Notes

> **⚠️ Disclaimer:** This plugin was vibe coded. Use at your own risk and back up your vault.

Device-specific inbox notes for Obsidian. Unlike other homepage/startup plugins that only distinguish between mobile and desktop, this plugin identifies each unique device and lets you set a specific inbox note for it.

## Features

- **Device-Specific Inboxes** - Each device gets a unique identifier and can have its own inbox note
- **Auto-Open on Startup** - Optionally open your inbox note when Obsidian launches
- **Quick Commands**:
  - "Open inbox note" - Jump to your inbox anytime
  - "Set active file as inbox for this device" - Quick configuration from any note
- **Multi-Device Management** - View and manage inbox notes for all your devices in one place
- **Auto-Create** - Inbox files are created automatically if they don't exist

## Installation

1. Download `main.js` and `manifest.json` from releases
2. Create folder: `.obsidian/plugins/inbox-notes/`
3. Copy files into folder
4. Restart Obsidian
5. Enable in Settings → Community Plugins

## Setup

### Quick Setup

1. Open the note you want to use as your inbox
2. Run command (Ctrl/Cmd + P): "Set active file as inbox for this device"
3. Done!

### Manual Setup

Go to Settings → Inbox Notes:

- **Open inbox on startup**: Toggle auto-open (default: enabled)
- **Device name**: Give your device a friendly name (defaults to platform info like "macOS Desktop")
- **Inbox note path**: Path to your inbox note (e.g., "Inbox.md" or "Notes/Inbox.md")

## Usage

### Opening Your Inbox

- **Command Palette** (Ctrl/Cmd + P) → "Open inbox note"
- **Ribbon Icon** - Click the inbox icon in the left sidebar
- **On Startup** - Automatically opens if enabled in settings

### Multi-Device Setup

When you use Obsidian on multiple devices with the same vault (via sync):

1. Each device automatically registers itself with a unique ID
2. Configure inbox path separately for each device
3. View all devices in Settings → Inbox Notes → All Devices
4. Delete old devices you no longer use (current device cannot be deleted)

## Use Cases

- Different workflows on different machines (work computer, personal laptop, tablet, phone)
- Separate inbox notes for home office vs work office
- Testing and development on multiple devices

## Future Ideas

- Quick capture functionality to append to inbox from anywhere
- Keyboard shortcuts for opening inbox

## Development

```bash
npm install
npm run build
```

## License

MIT © 2026 Jani Laatunen
