# Inbox Notes

> **⚠️ Disclaimer:** This plugin was vibe coded. Use at your own risk and back up your vault.

Device-specific inbox notes for Obsidian. Unlike other homepage/startup plugins that only distinguish between mobile and desktop, this plugin identifies each unique device and lets you set a specific inbox note for it.

## Features

- **Device-Specific Inboxes** - Each device gets a unique identifier (stored locally, not synced) and can have its own inbox note
- **Auto-Open on Startup** - Optionally open your inbox note when Obsidian launches
- **Quick Commands**:
  - "Open inbox note" - Jump to your inbox anytime
  - "Set active file as inbox for this device" - Quick configuration from any note
- **Multi-Device Management** - View and manage inbox notes for all your devices in a clean table interface
- **Auto-Create** - Inbox files are created automatically if they don't exist
- **Ribbon Icon** - Quick access from the sidebar

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

### Settings Interface

Go to Settings → Inbox Notes to see:

- **Open inbox on startup** - Toggle to auto-open your inbox when Obsidian launches
- **Devices Table** - Manage all devices that have accessed this vault

The devices table shows:
- **Device ID** - Unique identifier for each device (with "THIS DEVICE" tag for current device)
- **Device Name** - Editable friendly name (e.g., "MacBook Pro", "iPhone")
- **Inbox Note Path** - Editable path to the inbox note for this device
- **Actions** - Delete button for other devices (current device cannot be deleted)

## Usage

### Opening Your Inbox

- **Command Palette** (Ctrl/Cmd + P) → "Open inbox note"
- **Ribbon Icon** - Click the inbox icon in the left sidebar
- **On Startup** - Automatically opens if enabled in settings

### Multi-Device Setup

When you use Obsidian on multiple devices with the same vault (via sync):

1. **First time on each device**: The plugin automatically detects it's a new device and creates a unique device ID (stored in localStorage, not synced)
2. **Default inbox**: Each new device starts with "Inbox" as the default inbox note path
3. **Customize per device**: Edit the device name and inbox path directly in the table
4. **View all devices**: The table shows all devices that have ever accessed the vault
5. **Clean up**: Delete old devices you no longer use (current device shows "—" instead of Delete button)

### How Device Detection Works

- Each device generates a unique ID on first launch and stores it in **localStorage** (device-specific)
- Device IDs are **NOT synced** across devices - each device has its own ID
- Device configurations (names and inbox paths) **ARE synced** via `data.json`
- When you open the vault on a new device, it automatically appears in the table on all devices

## Use Cases

- **Different workflows** on different machines (work computer, personal laptop, tablet, phone)
- **Separate inbox notes** for home office vs work office
- **Testing and development** on multiple devices
- **Family vaults** where each person's device has a different inbox

## Future Ideas

- Quick capture functionality to append to inbox from anywhere
- Keyboard shortcuts for opening inbox
- Template support for new inbox files

## Development

```bash
npm install
npm run build
```

## License

MIT © 2026 Jani Laatunen
