import { ItemView, WorkspaceLeaf, Notice, requestUrl } from "obsidian";

export const VIEW_TYPE_ANKI = "anki-link-view";

interface AnkiCard {
	cardId: number;
	fields: Record<string, { value: string; order: number }>;
	modelName: string;
	deckName: string;
	question: string;
	answer: string;
}

export class AnkiView extends ItemView {
	private cardsContainer: HTMLElement | null = null;

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

		// Add fetch button
		const buttonContainer = container.createEl("div", { cls: "anki-button-container" });
		const fetchButton = buttonContainer.createEl("button", { text: "Fetch cards" });
		fetchButton.addEventListener("click", () => {
			void this.fetchAndDisplayCards();
		});

		// Create container for cards
		this.cardsContainer = container.createEl("div", { cls: "anki-cards-container" });
	}

	async fetchAndDisplayCards() {
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
			new Notice("No Anki URIs found in current note.");
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

		const allCards: AnkiCard[] = [];

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

				const data = response.json as { result?: AnkiCard[]; error?: string };
				new Notice(`Received: ${JSON.stringify(data, null, 2)}`);

				if (data.result) {
					allCards.push(...data.result);
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				new Notice(`Failed to connect: ${errorMessage}`);
				return;
			}
		}

		// Query AnkiConnect for note info if we have note IDs
		// For now, we'll skip notes and focus on cards
		// TODO: Handle note IDs by getting their cards

		// Render the cards
		this.renderCards(allCards);
	}

	renderCards(cards: AnkiCard[]) {
		if (!this.cardsContainer) return;

		// Clear existing cards
		this.cardsContainer.empty();

		if (cards.length === 0) {
			this.cardsContainer.createEl("p", { text: "No cards found" });
			return;
		}

		// Create a card element for each Anki card
		for (const card of cards) {
			const cardEl = this.cardsContainer.createEl("div", { cls: "anki-card" });

			// Add card metadata header
			const metaEl = cardEl.createEl("div", { cls: "anki-card-meta" });
			metaEl.createEl("span", { text: `${card.deckName} - ${card.modelName}`, cls: "anki-card-deck" });

			// Add fields
			const fieldsEl = cardEl.createEl("div", { cls: "anki-card-fields" });

			// Sort fields by order
			const sortedFields = Object.entries(card.fields).sort((a, b) => a[1].order - b[1].order);

			sortedFields.forEach(([fieldName, fieldData], index) => {
				const fieldEl = fieldsEl.createEl("div", { cls: "anki-card-field" });
				fieldEl.createEl("div", { text: fieldName, cls: "anki-card-field-name" });
				fieldEl.createEl("div", { text: fieldData.value, cls: "anki-card-field-value" });

				// Add horizontal ruler between fields (but not after the last one)
				if (index < sortedFields.length - 1) {
					fieldEl.createEl("hr", { cls: "anki-card-field-separator" });
				}
			});
		}
	}

	async onClose() {
		// Nothing to clean up yet
	}
}
