import {LitElement, html, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {when} from 'lit/directives/when.js';

import * as rgc from 'read-gedcom';

@customElement('hp-gc')
class HPGC extends LitElement {

  @state()
  protected _myGedFile: ArrayBuffer | undefined = undefined;
  
  @state()
  protected _myGedData: rgc.SelectionGedcom | undefined = undefined;

  @property()
  public myGedUrl: string;

  public constructor() {
    super();
    this.myGedUrl = '';
  };

  render() {
    return html`
    <div>
      <h4 class="h3">Biographical Information</h4>
      <div class="mb-0" id="bio-info">
        Birthday: <span >didn't work</span><br/>
        Death: <span ></span>
      </div>
    </div>
    `;
  };

}

declare global {
  interface HTMLElementTagNameMap {
    "hp-gc", HPGC;
  }
};

// vim: shiftwidth=2:tabstop=2:expandtab

