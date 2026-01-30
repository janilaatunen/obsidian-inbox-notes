# Obsidian Inbox Notes

A plugin that allows you to configure different inbox notes for each device where you use Obsidian. Unlike other homepage/startup plugins that only distinguish between mobile and desktop, this plugin identifies each unique device and lets you set a specific inbox note for it.

## Features

- **Device-Specific Inbox**: Each device gets a unique identifier and can have its own inbox note
- **Auto-Open on Startup**: Optionally open your inbox note when Obsidian launches
- **Quick Commands**:
  - "Open inbox note" - Jump to your inbox anytime
  - "Set active file as inbox for this device" - Quick configuration from any note
- **Multi-Device Management**: View and manage inbox notes for all your devices in one place

## Use Cases

- Different workflows on different machines (work computer, personal laptop, tablet, phone)
- Separate inbox notes for home office vs work office
- Testing and development on multiple devices

## Usage

### Initial Setup

1. Install and enable the plugin
2. The plugin will automatically detect your device and assign it a unique ID
3. Go to Settings → Inbox Notes
4. Configure your inbox note path (e.g., "Inbox.md" or "Notes/Inbox.md")

### Quick Setup

1. Open the note you want to use as your inbox
2. Run command: "Set active file as inbox for this device"
3. Done!

### Settings

**Open inbox on startup**: Toggle whether your inbox opens automatically when Obsidian starts

**Device name**: Give your device a friendly name (defaults to platform info like "macOS Desktop")

**Inbox note path**: The path to your inbox note file

**Use active file**: Quick button to set the currently open note as your inbox

## Device Management

When you use Obsidian on multiple devices with the same vault (via sync), each device will automatically register itself. You can:

- View all registered devices in the settings
- See which inbox note is configured for each device
- Delete old devices you no longer use (except the current device)
- The current device is highlighted in the device list

## Future Ideas

- Quick capture functionality to append to inbox from anywhere
- Template support for new inbox entries
- Keyboard shortcuts for opening inbox
- Integration with daily notes

## Disclaimer

This plugin is "vibe coded" - it prioritizes functionality over perfect code quality. Always backup your vault before using any community plugin!

## License

MIT

## Author

Jani Laatunen
