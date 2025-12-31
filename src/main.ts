import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, AnkiLinkSettings, AnkiLinkSettingTab } from "./settings";

export default class AnkiLink extends Plugin {
	settings: AnkiLinkSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AnkiLinkSettingTab(this.app, this));
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
