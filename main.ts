import { App, Plugin, PluginSettingTab, Setting, Notice, TFile, Platform, setIcon } from 'obsidian';

interface DeviceConfig {
	id: string;
	name: string;
	inboxPath: string;
}

interface InboxNotesSettings {
	devices: DeviceConfig[];
	currentDeviceId: string;
	openOnStartup: boolean;
	hasOpenedOnce: boolean; // Prevent multiple opens in same session
}

const DEFAULT_SETTINGS: InboxNotesSettings = {
	devices: [],
	currentDeviceId: '',
	openOnStartup: true,
	hasOpenedOnce: false
}

export default class InboxNotesPlugin extends Plugin {
	settings: InboxNotesSettings;

	async onload() {
		await this.loadSettings();

		// Initialize device on first load
		await this.ensureDeviceConfigured();

		console.log('Inbox Notes plugin loaded');

		// Add command to open inbox
		this.addCommand({
			id: 'open-inbox-note',
			name: 'Open inbox note',
			callback: () => {
				this.openInboxNote();
			}
		});

		// Add command to manually set inbox for current device
		this.addCommand({
			id: 'set-inbox-to-active-file',
			name: 'Set active file as inbox for this device',
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					if (!checking) {
						this.setInboxToActiveFile(activeFile);
					}
					return true;
				}
				return false;
			}
		});

		// Add settings tab
		this.addSettingTab(new InboxNotesSettingTab(this.app, this));

		// Add ribbon icon
		this.addRibbonIcon('inbox', 'Open inbox note', () => {
			this.openInboxNote();
		});

		// Open inbox on startup
		this.app.workspace.onLayoutReady(() => {
			if (this.settings.openOnStartup && !this.settings.hasOpenedOnce) {
				this.openInboxNote();
				this.settings.hasOpenedOnce = true;
				this.saveSettings();
			}
		});

		// Reset hasOpenedOnce flag when workspace changes significantly
		this.registerEvent(
			this.app.workspace.on('quit', () => {
				this.settings.hasOpenedOnce = false;
				this.saveSettings();
			})
		);
	}

	onunload() {
		console.log('Inbox Notes plugin unloaded');
	}

	/**
	 * Generate a unique device ID
	 */
	generateDeviceId(): string {
		return 'device-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
	}

	/**
	 * Get a human-readable device name based on platform
	 */
	getDefaultDeviceName(): string {
		const platform = Platform.isMobile ? 'Mobile' : 'Desktop';
		const os = Platform.isIosApp ? 'iOS' :
				   Platform.isAndroidApp ? 'Android' :
				   Platform.isMacOS ? 'macOS' :
				   Platform.isWin ? 'Windows' :
				   Platform.isLinux ? 'Linux' : 'Unknown';

		return `${os} ${platform}`;
	}

	/**
	 * Get device ID from localStorage (device-specific, not synced)
	 */
	getDeviceId(): string {
		const storageKey = 'inbox-notes-device-id';
		let deviceId = localStorage.getItem(storageKey);

		if (!deviceId) {
			deviceId = this.generateDeviceId();
			localStorage.setItem(storageKey, deviceId);
			console.log('Generated new device ID:', deviceId);
		}

		return deviceId;
	}

	/**
	 * Ensure current device is configured
	 */
	async ensureDeviceConfigured() {
		// Get device ID from localStorage (not synced)
		const deviceId = this.getDeviceId();
		this.settings.currentDeviceId = deviceId;

		// Check if this device exists in devices array
		const deviceExists = this.settings.devices.some(d => d.id === deviceId);

		if (!deviceExists) {
			// Add new device configuration
			const newDevice: DeviceConfig = {
				id: deviceId,
				name: this.getDefaultDeviceName(),
				inboxPath: 'Inbox'
			};
			this.settings.devices.push(newDevice);
			await this.saveSettings();

			console.log('Configured new device:', newDevice);
		}
	}

	/**
	 * Get current device configuration
	 */
	getCurrentDevice(): DeviceConfig | undefined {
		return this.settings.devices.find(d => d.id === this.settings.currentDeviceId);
	}

	/**
	 * Open the inbox note for current device
	 */
	async openInboxNote() {
		const device = this.getCurrentDevice();

		if (!device) {
			new Notice('Device not configured. Check plugin settings.');
			return;
		}

		if (!device.inboxPath) {
			new Notice('No inbox note configured for this device. Set it in plugin settings or use "Set active file as inbox" command.');
			return;
		}

		// Ensure path has .md extension
		let inboxPath = device.inboxPath;
		if (!inboxPath.endsWith('.md')) {
			inboxPath = inboxPath + '.md';
		}

		// Check if file exists
		let file = this.app.vault.getAbstractFileByPath(inboxPath);

		if (!file) {
			// File doesn't exist, create it
			try {
				// Ensure parent folder exists
				const lastSlashIndex = inboxPath.lastIndexOf('/');
				if (lastSlashIndex > 0) {
					const folderPath = inboxPath.substring(0, lastSlashIndex);
					const folder = this.app.vault.getAbstractFileByPath(folderPath);
					if (!folder) {
						await this.app.vault.createFolder(folderPath);
					}
				}

				// Create the inbox file (empty)
				file = await this.app.vault.create(inboxPath, '');
				new Notice(`Created inbox note: ${inboxPath}`);
			} catch (error) {
				console.error('Error creating inbox note:', error);
				new Notice(`Failed to create inbox note: ${inboxPath}`);
				return;
			}
		}

		if (!(file instanceof TFile)) {
			new Notice(`Inbox path is not a file: ${inboxPath}`);
			return;
		}

		// Open the file in Obsidian
		const leaf = this.app.workspace.getLeaf(false);
		await leaf.openFile(file);
	}

	/**
	 * Set active file as inbox for current device
	 */
	async setInboxToActiveFile(file: TFile) {
		const device = this.getCurrentDevice();

		if (!device) {
			new Notice('Device not configured. Check plugin settings.');
			return;
		}

		// Update device configuration
		device.inboxPath = file.path;
		await this.saveSettings();

		new Notice(`Set "${file.path}" as inbox for ${device.name}`);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class InboxNotesSettingTab extends PluginSettingTab {
	plugin: InboxNotesPlugin;

	constructor(app: App, plugin: InboxNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h1', { text: 'Inbox Notes Settings' });

		// Startup Settings section
		containerEl.createEl('h2', { text: 'Startup Settings' });

		new Setting(containerEl)
			.setName('Open inbox on startup')
			.setDesc('Automatically open the inbox note when Obsidian starts')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.openOnStartup)
				.onChange(async (value) => {
					this.plugin.settings.openOnStartup = value;
					await this.plugin.saveSettings();
				}));

		// Devices section
		containerEl.createEl('h2', { text: 'Devices' });

		this.plugin.settings.devices.forEach((device, index) => {
			const isCurrentDevice = device.id === this.plugin.settings.currentDeviceId;

			// Device card container
			const deviceCard = containerEl.createDiv({
				cls: isCurrentDevice ? 'inbox-notes-device-card current' : 'inbox-notes-device-card'
			});

			// Device ID heading with tag and delete button
			const headerContainer = deviceCard.createDiv({ cls: 'inbox-notes-device-header' });

			const headingGroup = headerContainer.createDiv({ cls: 'inbox-notes-heading-group' });
			const heading = headingGroup.createEl('h3', { text: device.id });
			if (isCurrentDevice) {
				headingGroup.createEl('span', {
					text: 'THIS DEVICE',
					cls: 'inbox-notes-current-tag'
				});
			}

			// Delete icon (only for non-current devices)
			if (!isCurrentDevice) {
				const deleteIcon = headerContainer.createDiv({ cls: 'inbox-notes-delete-icon' });
				deleteIcon.setAttribute('aria-label', 'Delete device');
				deleteIcon.addEventListener('click', async () => {
					this.plugin.settings.devices.splice(index, 1);
					await this.plugin.saveSettings();
					new Notice(`Deleted device: ${device.name}`);
					this.display();
				});
				// Set trash icon using Obsidian's setIcon
				setIcon(deleteIcon, 'trash-2');
			}

			// Device Name setting
			new Setting(deviceCard)
				.setName('Device name')
				.setDesc('Friendly name for this device')
				.addText(text => text
					.setPlaceholder('My Device')
					.setValue(device.name)
					.onChange(async (value) => {
						device.name = value || this.plugin.getDefaultDeviceName();
						await this.plugin.saveSettings();
					}));

			// Inbox Path setting
			new Setting(deviceCard)
				.setName('Inbox note path')
				.setDesc('Path to the inbox note (e.g., "Inbox.md" or "Daily/Inbox.md")')
				.addText(text => {
					text
						.setPlaceholder('Inbox.md')
						.setValue(device.inboxPath)
						.onChange(async (value) => {
							device.inboxPath = value || 'Inbox';
							await this.plugin.saveSettings();
						});
					text.inputEl.style.width = '100%';
				});
		});

		// Add styles
		const style = containerEl.createEl('style');
		style.textContent = `
			.inbox-notes-device-card {
				padding: 1em;
				margin: 1em 0;
				border: 1px solid var(--background-modifier-border);
				border-radius: 6px;
				background: var(--background-primary);
				position: relative;
			}
			.inbox-notes-device-card.current {
				border-color: var(--interactive-accent);
				border-width: 2px;
			}
			.inbox-notes-device-header {
				display: flex;
				align-items: flex-start;
				justify-content: space-between;
				margin-bottom: 1em;
			}
			.inbox-notes-heading-group {
				display: flex;
				align-items: center;
				gap: 0.75em;
				flex: 1;
			}
			.inbox-notes-device-header h3 {
				margin: 0;
				font-family: var(--font-monospace);
				font-size: 0.9em;
				color: var(--text-muted);
				font-weight: 500;
			}
			.inbox-notes-current-tag {
				display: inline-block;
				padding: 0.25em 0.6em;
				background: var(--interactive-accent);
				color: var(--text-on-accent);
				border-radius: 3px;
				font-size: 0.7em;
				font-weight: 600;
				text-transform: uppercase;
				letter-spacing: 0.5px;
				white-space: nowrap;
			}
			.inbox-notes-delete-icon {
				cursor: pointer;
				padding: 0.25em;
				border-radius: 4px;
				color: var(--text-muted);
				transition: all 0.15s ease;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.inbox-notes-delete-icon:hover {
				background: var(--background-modifier-error-hover);
				color: var(--text-error);
			}
			.inbox-notes-delete-icon svg {
				width: 18px;
				height: 18px;
			}
		`;
	}
}
