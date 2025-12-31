import { App, PluginSettingTab, Setting } from "obsidian";
import AnkiLink from "./main";

export interface AnkiLinkSettings {
	mySetting: string;
}

export const DEFAULT_SETTINGS: AnkiLinkSettings = {
	mySetting: 'default'
}

export class AnkiLinkSettingTab extends PluginSettingTab {
	plugin: AnkiLink;

	constructor(app: App, plugin: AnkiLink) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Settings #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
