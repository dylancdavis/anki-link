"Anki Link" is an Obsidian addon project that will provide Obsidian-Anki integration by linking flashcards instances to a specific location inside a specific Obsidian note. Note that there already exist multiple tools that provide some sort of similar integration between the two:

-   [Obsidian_to_Anki](https://github.com/ObsidianToAnki/Obsidian_to_Anki) is a plugin that allows adding Anki flashcards through text or markdown. It also exists as an Obsidian-independent Python script.
-   [Obsidian Anki Sync](https://github.com/debanjandhar12/Obsidian-Anki-Sync) is a similar plugin. It uses HTML-comment style declarations for card adding.
-   [Obsidian Anki Bridge](https://jeppeklitgaard.github.io/ObsidianAnkiBridge/) allows similar syncing to Anki using anki-tagged code blocks.
-   [Yanki](https://github.com/kitschpatrol/yanki-obsidian) syncs all notes in a specific folder as Anki flashcards.

Why integrate Obsidian and Anki?

1. Seeing our "test coverage" for knowledge-based notes
2. With knowledge changes, update flashcards in the same location
3. Linking flashcards to notes gets us Obsidian's semantic linking "for free"
4. Easily edit all the flashcards related to a note in the same place. Most of the above plugins function by having you declare Anki cards in-line within a note, with Obsidian notes acting as the source of truth.

The goal of this plugin is to keep Anki's cards as their own source of truth, and instead provide a mechanism for linking sections of text to a given flashcard. Both Anki and Obsidian support URI schemas. So, to link a region of text to a card, we should have that text exist as a hyperlink to the corresponding Anki card's URI (with the anki schema). The role of the plugin, then, is to provide a convenient interface for viewing those linked cards.

Roadmap:

-   For a given note, all hyperlinks to an Anki note can be viewed within a new tab on the right sidebar.
-   The styling for Anki-schema hyperlinks differs from regular hyperlinks. Ideally, they are more subtle (so that large regions of linked text aren't bright colors).
-   Cards can be edited through the new tab in the right sidebar.
-   Highlighted text gains a new context menu option for creating a new card linked to that text
