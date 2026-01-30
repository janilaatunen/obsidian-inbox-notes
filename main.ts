import { App, Plugin, PluginSettingTab, Setting, Notice, TFile, Platform } from 'obsidian';

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
		return 'device-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
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
	 * Ensure current device is configured
	 */
	async ensureDeviceConfigured() {
		// If no device ID, generate one
		if (!this.settings.currentDeviceId) {
			this.settings.currentDeviceId = this.generateDeviceId();
			await this.saveSettings();
		}

		// Check if this device exists in devices array
		const deviceExists = this.settings.devices.some(d => d.id === this.settings.currentDeviceId);

		if (!deviceExists) {
			// Add new device configuration
			const newDevice: DeviceConfig = {
				id: this.settings.currentDeviceId,
				name: this.getDefaultDeviceName(),
				inboxPath: ''
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
				const folderPath = inboxPath.substring(0, inboxPath.lastIndexOf('/'));
				if (folderPath && folderPath.length > 0) {
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

		// Open on startup setting
		new Setting(containerEl)
			.setName('Open inbox on startup')
			.setDesc('Automatically open the inbox note when Obsidian starts')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.openOnStartup)
				.onChange(async (value) => {
					this.plugin.settings.openOnStartup = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h2', { text: 'Current Device' });

		const currentDevice = this.plugin.getCurrentDevice();
		if (currentDevice) {
			// Device info
			const infoEl = containerEl.createDiv({ cls: 'inbox-notes-device-info' });
			infoEl.createEl('p', {
				text: `Device ID: ${currentDevice.id}`,
				cls: 'inbox-notes-device-id'
			});

			// Device name
			new Setting(containerEl)
				.setName('Device name')
				.setDesc('A friendly name to identify this device')
				.addText(text => text
					.setPlaceholder('My Device')
					.setValue(currentDevice.name)
					.onChange(async (value) => {
						currentDevice.name = value || this.plugin.getDefaultDeviceName();
						await this.plugin.saveSettings();
					}));

			// Inbox path
			new Setting(containerEl)
				.setName('Inbox note path')
				.setDesc('Path to the inbox note for this device (e.g., "Inbox.md" or "Daily/Inbox.md"). File will be created if it doesn\'t exist.')
				.addText(text => {
					text
						.setPlaceholder('Inbox.md')
						.setValue(currentDevice.inboxPath)
						.onChange(async (value) => {
							currentDevice.inboxPath = value;
							await this.plugin.saveSettings();
						});
					text.inputEl.style.width = '100%';
				});
		}

		// All devices section
		if (this.plugin.settings.devices.length > 1) {
			containerEl.createEl('h2', { text: 'All Devices' });
			containerEl.createEl('p', {
				text: 'Manage inbox notes for all your devices. The highlighted device is the current one.',
				cls: 'setting-item-description'
			});

			this.plugin.settings.devices.forEach((device, index) => {
				const isCurrentDevice = device.id === this.plugin.settings.currentDeviceId;
				const deviceContainer = containerEl.createDiv({
					cls: isCurrentDevice ? 'inbox-notes-device current-device' : 'inbox-notes-device'
				});

				const header = deviceContainer.createDiv({ cls: 'inbox-notes-device-header' });
				header.createEl('strong', {
					text: device.name + (isCurrentDevice ? ' (Current)' : '')
				});

				const pathText = device.inboxPath || 'Not configured';
				deviceContainer.createEl('p', {
					text: `Inbox: ${pathText}`,
					cls: 'inbox-notes-device-path'
				});

				// Delete button (only for non-current devices)
				if (!isCurrentDevice) {
					new Setting(deviceContainer)
						.addButton(button => button
							.setButtonText('Delete device')
							.setWarning()
							.onClick(async () => {
								this.plugin.settings.devices.splice(index, 1);
								await this.plugin.saveSettings();
								new Notice(`Deleted device: ${device.name}`);
								this.display();
							}));
				}
			});
		}

		// Add styles
		const style = containerEl.createEl('style');
		style.textContent = `
			.inbox-notes-device {
				padding: 1em;
				margin: 1em 0;
				border: 1px solid var(--background-modifier-border);
				border-radius: 5px;
			}
			.inbox-notes-device.current-device {
				background: var(--background-secondary);
				border-color: var(--interactive-accent);
			}
			.inbox-notes-device-header {
				margin-bottom: 0.5em;
			}
			.inbox-notes-device-path {
				font-family: var(--font-monospace);
				font-size: 0.9em;
				color: var(--text-muted);
				margin: 0.5em 0;
			}
			.inbox-notes-device-id {
				font-family: var(--font-monospace);
				font-size: 0.85em;
				color: var(--text-muted);
			}
		`;
	}
}
