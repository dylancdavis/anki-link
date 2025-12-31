import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_ANKI = "anki-link-view";

export class AnkiView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_ANKI;
	}

	getDisplayText() {
		return "Anki Cards";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Anki Cards" });
		container.createEl("p", { text: "This view will display Anki cards linked to the current note." });
	}

	async onClose() {
		// Nothing to clean up yet
	}
}
