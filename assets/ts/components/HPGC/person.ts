import {LitElement, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {when} from 'lit/directives/when.js';
import {html, literal} from 'lit/static-html.js';

import * as rgc from 'read-gedcom';

@customElement('hp-person')
export class HPPerson extends LitElement {

  @property()
  public myGedId: string;

  public constructor() {
    super ();

    this.myGedId = '';
  };

  render() { 
    return html`
    <h4 class="h3">Biographical Information</h4>
    <div class="mb-0" id="bio-info" .myGedId=${ifDefined(this.myGedId)} >
      Birthday: <span></span><br/>
      Deathday: <span></span>
    </div>
    `;
  };

}

// vim: shiftwidth=2:tabstop=2:expandtab

