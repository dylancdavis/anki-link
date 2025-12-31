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
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();

		// Create container for cards
		this.cardsContainer = container.createEl("div", { cls: "anki-cards-container" });

		// Register event listener for file changes
		this.registerEvent(
			this.app.workspace.on("file-open", () => {
				void this.fetchAndDisplayCards();
			})
		);

		// Initial fetch for currently active file
		void this.fetchAndDisplayCards();
	}

	async fetchAndDisplayCards() {
		// Get the active file
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			this.renderPlaceholder("No note is currently open.");
			return;
		}

		// Read the file content
		const content = await this.app.vault.read(activeFile);

		// Search for anki:// URIs - looking for patterns like anki://note/123 or anki://card/456
		const ankiUriRegex = /anki:\/\/(note|card)\/(\d+)/g;
		const matches = [...content.matchAll(ankiUriRegex)];

		if (matches.length === 0) {
			this.renderPlaceholder("No Anki links found in this note.");
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
		const notFoundCardIds: number[] = [];

		// Query AnkiConnect for card info if we have card IDs
		if (cardIds.length > 0) {
			const request = {
				action: "cardsInfo",
				version: 6,
				params: {
					cards: cardIds
				}
			};

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

				if (data.error) {
					new Notice(`AnkiConnect error: ${data.error}`);
					this.renderPlaceholder(`Error from AnkiConnect: ${data.error}`);
					return;
				}

				if (data.result) {
					// Filter out null/empty results and track which cards weren't found
					const foundCardIds = new Set<number>();
					for (const card of data.result) {
						if (card && card.cardId) {
							allCards.push(card);
							foundCardIds.add(card.cardId);
						}
					}

					// Identify cards that weren't found
					for (const cardId of cardIds) {
						if (!foundCardIds.has(cardId)) {
							notFoundCardIds.push(cardId);
						}
					}
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				new Notice(`Failed to connect to AnkiConnect: ${errorMessage}`);
				this.renderPlaceholder("Failed to connect to AnkiConnect. Make sure Anki is running with the AnkiConnect add-on installed.");
				return;
			}
		}

		// Query AnkiConnect for note info if we have note IDs
		// For now, we'll skip notes and focus on cards
		// TODO: Handle note IDs by getting their cards

		// Render the cards with info about not found cards
		this.renderCards(allCards, notFoundCardIds);
	}

	renderPlaceholder(message: string) {
		if (!this.cardsContainer) return;

		this.cardsContainer.empty();
		this.cardsContainer.createEl("p", {
			text: message,
			cls: "anki-placeholder"
		});
	}

	renderCards(cards: AnkiCard[], notFoundCardIds: number[]) {
		if (!this.cardsContainer) return;

		// Clear existing cards
		this.cardsContainer.empty();

		if (cards.length === 0 && notFoundCardIds.length === 0) {
			this.cardsContainer.createEl("p", { text: "No cards found" });
			return;
		}

		// Create a card element for each Anki card
		for (const card of cards) {
			const cardEl = this.cardsContainer.createEl("div", { cls: "anki-card" });

			// Add card metadata header
			const metaEl = cardEl.createEl("div", { cls: "anki-card-meta" });
			metaEl.createEl("span", { text: card.deckName, cls: "anki-card-deck" });
			metaEl.createEl("span", { text: card.modelName, cls: "anki-card-model" });

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

		// Show dropdown for cards that weren't found
		if (notFoundCardIds.length > 0) {
			const notFoundContainer = this.cardsContainer.createEl("div", { cls: "anki-not-found-container" });

			const notFoundText = notFoundCardIds.length === 1
				? "Could not find 1 card"
				: `Could not find ${notFoundCardIds.length} cards`;

			const toggleHeader = notFoundContainer.createEl("div", {
				text: notFoundText,
				cls: "anki-not-found-toggle"
			});

			const contentEl = notFoundContainer.createEl("div", { cls: "anki-not-found-content anki-not-found-content-hidden" });

			// Add list of card IDs
			const listEl = contentEl.createEl("ul", { cls: "anki-not-found-list" });
			for (const cardId of notFoundCardIds) {
				listEl.createEl("li", { text: `Card ID: ${cardId}` });
			}

			// Toggle visibility on click
			toggleHeader.addEventListener("click", () => {
				const isHidden = contentEl.hasClass("anki-not-found-content-hidden");
				contentEl.toggleClass("anki-not-found-content-hidden", !isHidden);
				toggleHeader.toggleClass("anki-not-found-toggle-open", isHidden);
			});
		}
	}

	async onClose() {
		// Nothing to clean up yet
	}
}
