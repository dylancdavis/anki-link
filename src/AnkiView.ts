import { ItemView, WorkspaceLeaf, Notice, requestUrl } from "obsidian";

export const VIEW_TYPE_ANKI = "anki-link-view";

export class AnkiView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_ANKI;
	}

	getDisplayText() {
		return "Anki cards";
	}

	getIcon() {
		return "layers";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Anki cards" });
		container.createEl("p", { text: "This view will display Anki cards linked to the current note." });

		// Add test connection button
		const buttonContainer = container.createEl("div", { cls: "anki-test-button-container" });
		const testButton = buttonContainer.createEl("button", { text: "Test Anki connect" });
		testButton.addEventListener("click", () => {
			void this.testAnkiConnect();
		});
	}

	async testAnkiConnect() {
		try {
			const response = await requestUrl({
				url: "http://localhost:8765",
				method: "POST",
				body: JSON.stringify({
					action: "version",
					version: 6
				}),
				headers: {
					"Content-Type": "application/json"
				}
			});

			const data = response.json as { result?: number; error?: string };

			if (data.error) {
				new Notice(`AnkiConnect error: ${data.error}`);
			} else {
				new Notice(`AnkiConnect is running! Version: ${data.result ?? "unknown"}`);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			new Notice(`Failed to connect to AnkiConnect: ${errorMessage}`);
		}
	}

	async onClose() {
		// Nothing to clean up yet
	}
}
