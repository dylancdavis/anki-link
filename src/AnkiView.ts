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
		// Get the active file
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("No active note found");
			return;
		}

		// Read the file content
		const content = await this.app.vault.read(activeFile);

		// Search for anki:// URIs - looking for patterns like anki://note/123 or anki://card/456
		const ankiUriRegex = /anki:\/\/(note|card)\/(\d+)/g;
		const matches = [...content.matchAll(ankiUriRegex)];

		if (matches.length === 0) {
			new Notice("No Anki URIs found in current note");
			return;
		}

		// Extract card IDs and note IDs
		const cardIds: number[] = [];
		const noteIds: number[] = [];

		for (const match of matches) {
			const [, type, id] = match;
			if (type === "card") {
				cardIds.push(Number(id));
			} else if (type === "note") {
				noteIds.push(Number(id));
			}
		}

		// Query AnkiConnect for card info if we have card IDs
		if (cardIds.length > 0) {
			const request = {
				action: "cardsInfo",
				version: 6,
				params: {
					cards: cardIds
				}
			};

			new Notice(`Sending: ${JSON.stringify(request, null, 2)}`);

			try {
				const response = await requestUrl({
					url: "http://localhost:8765",
					method: "POST",
					body: JSON.stringify(request),
					headers: {
						"Content-Type": "application/json"
					}
				});

				const data = response.json as { result?: unknown; error?: string };
				new Notice(`Received: ${JSON.stringify(data, null, 2)}`);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				new Notice(`Failed to connect: ${errorMessage}`);
			}
		}

		// Query AnkiConnect for note info if we have note IDs
		if (noteIds.length > 0) {
			const request = {
				action: "notesInfo",
				version: 6,
				params: {
					notes: noteIds
				}
			};

			new Notice(`Sending: ${JSON.stringify(request, null, 2)}`);

			try {
				const response = await requestUrl({
					url: "http://localhost:8765",
					method: "POST",
					body: JSON.stringify(request),
					headers: {
						"Content-Type": "application/json"
					}
				});

				const data = response.json as { result?: unknown; error?: string };
				new Notice(`Received: ${JSON.stringify(data, null, 2)}`);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				new Notice(`Failed to connect: ${errorMessage}`);
			}
		}
	}

	async onClose() {
		// Nothing to clean up yet
	}
}
