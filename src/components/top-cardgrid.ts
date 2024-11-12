import { customElement } from "lit/decorators.js";

import { CardGrid } from "./card-grid.ts";

@customElement("top-cardgrid")
export default class TopCardGrid extends CardGrid {
  public constructor() {
    super();
    this.gridsections = [
      {
        title: "Encyclopedic Reference",
        target: "harrypedia",
        description: "My notes and speculation about the series",
        name: "hugeicons:books-01",
      },
      {
        title: "Searches",
        name: "game-icons:magnifying-glass",
        description:
          "Links to saved searches for various collections of fan fiction",
      },
      {
        title: "Bookmarks",
        name: "game-icons:bookmark",
        description:
          "Bookmarks for works I find particularly memorable, worth re-reading, the source of good ideas, or want to keep track of for some other reason",
      },
      {
        title: "Fan Fiction",
        target: "fanfiction",
        description:
          "Self-hosted fan fiction. Largely incomplete, probably never to be completed, but satisfying an occasional itch.",
        name: "system-uicons:book-text",
      },
    ];
  }
}
