import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, AnkiLinkSettings, AnkiLinkSettingTab } from "./settings";
import { AnkiView, VIEW_TYPE_ANKI } from "./AnkiView";

export default class AnkiLink extends Plugin {
	settings: AnkiLinkSettings;

	async onload() {
		await this.loadSettings();

		// Register the custom view
		this.registerView(
			VIEW_TYPE_ANKI,
			(leaf) => new AnkiView(leaf)
		);

		// Add ribbon icon to open the view
		this.addRibbonIcon("layers", "View Anki cards", () => {
			this.activateView();
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AnkiLinkSettingTab(this.app, this));
	}

	onunload() {
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_ANKI);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_ANKI,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_ANKI)[0]
		);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<AnkiLinkSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
