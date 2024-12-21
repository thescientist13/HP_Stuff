// export const prerender = false;
import { LitElement, html, css, unsafeCSS } from "lit";
import { state, property } from "lit/decorators.js";

// Lit+SSR does not support Constructable Stylesheets for SSR (yet), so using Greenwood's raw loader for now
// https://github.com/lit/lit/issues/4862
// @ts-expect-error
// import GrampsCSS from "../../styles/Gramps.css" with { type: "css" };
import GrampsCSS from "../../styles/Gramps.css?type=raw";

import { GrampsState } from "./state.ts";

//@ts-expect-error
import * as GrampsZod from "../../lib/GrampsZodTypes.ts";

const DEBUG = false;

export class GenealogicalData extends LitElement {
  @property({ attribute: false })
  private state: GrampsState = new GrampsState();

  @state()
  private url: URL | string | null;

  constructor() {
    super();

    this.url = new URL("/gramps/gramps.json", document.URL);
  }

  async connectedCallback() {
    super.connectedCallback();
    if (DEBUG) console.log(`initial url is ${this.url}`);
    if (this.url instanceof URL) {
      const status = await this.state.fetchData(this.url);
      if (status) {
        this.requestUpdate("state");
      }
    }
  }

  static styles = [/*GrampsCSS*/ css`${unsafeCSS(GrampsCSS)}`];

  render() {
    const gramps = this.state.zodData;
    if (gramps !== null && gramps !== undefined) {
      if (DEBUG) console.log(`grampsParser/index render; `);

      let t = html``;
      if (gramps) {
        if (DEBUG)
          console.log(
            `grampsParser/index render; confirmed I have parsed data`,
          );
        t = html`${t}Gramps Data exported ${gramps.header.created.date}<br />`;
        const psize = gramps.people.person.length;
        t = html`${t}There are ${psize} people<br />`;
        const fsize = gramps.families.family.length;
        t = html`${t}There are ${fsize} families<br />`;
        const esize = gramps.events.event.length;
        t = html`${t}There are ${esize} events<br />`;
      }
      return html`${t}`;
    }
    return html`No Header Info Available`;
  }
}

customElements.define("genealogical-data", GenealogicalData);
