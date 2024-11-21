import { html, LitElement, css, type TemplateResult, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

const DEBUG = 1;

/*
 * This is intended as base class to be extended by one that simply implements a
 * constructor providing the secctions.
 * Because I'm using a complex object as the property type, it is almost useless on its own.
 */

export type CardDetails = {
  title: string;
  name: string;
  description?: string;
  target?: string;
};

@customElement("card-grid")
export class CardGrid extends LitElement {
  @property()
  public gridCards: CardDetails[] = new Array<CardDetails>();

  static localStyles = css`
    .cardGrid {
      display: flex;
      flex-wrap: wrap;
      flex-shrink: 0;
      gap: 2rem;
    }
  `;

  static styles = [CardGrid.localStyles];

  protected render() {
    if (DEBUG) {
      console.log(`CardGrid render start`);
    }
    const cardTemplates = new Array<TemplateResult>();
    if (this.gridCards.length > 0) {
      this.gridCards.map((section) => {
        cardTemplates.push(html`
          <horizontal-card
            cardTitle="${section.title}"
            iconName="${section.name}"
            iconHeight="1.2rem"
            iconWidth="1.2rem"
            description="${section.description ?? nothing}"
            targetLocation=${section.target ?? nothing}
          ></horizontal-card>
        `);
      });
    }

    return html` <div class="cardGrid" role="grid">${cardTemplates}</div> `;
  }
}
