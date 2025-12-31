import { Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, AnkiLinkSettings, AnkiLinkSettingTab } from "./settings";

export default class AnkiLink extends Plugin {
	settings: AnkiLinkSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AnkiLinkSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			new Notice("Click");
		});
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<AnkiLinkSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
