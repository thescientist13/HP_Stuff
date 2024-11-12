import { html, LitElement, css, type TemplateResult, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

const DEBUG = 1;

/*
 * This is intended as base class to be extended by one that simply implements a
 * constructor providing the secctions.
 * Because I'm using a complex object as the property type, it is almost useless on its own.
 */

type Section = {
  title: string;
  name: string;
  description?: string;
  target?: string;
};

@customElement("card-grid")
export class CardGrid extends LitElement {
  @property()
  public gridsections: Section[] = new Array<Section>();

  static styles = css`
    .cardGrid {
      display: flex;
      flex-wrap: wrap;
      flex-shrink: 0;
      gap: 2rem;
    }
  `;

  protected render() {
    if (DEBUG) {
      console.log(`CardGrid render start`);
    }
    const sectionsTemplates = new Array<TemplateResult>();
    if (this.gridsections.length > 0) {
      this.gridsections.map((section) => {
        sectionsTemplates.push(html`
          <horizontal-card
            title="${section.title}"
            iconName="${section.name}"
            iconHeight="1.2rem"
            iconWidth="1.2rem"
            description="${section.description ?? nothing}"
            targetLocation=${section.target ?? nothing}
          ></horizontal-card>
        `);
      });
    }

    return html` <div class="cardGrid" role="grid">${sectionsTemplates}</div> `;
  }
}
