import {LitElement, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {html, literal} from 'lit/static-html.js';

import {HPGC} from ".";

import * as rgc from 'read-gedcom';

@customElement('hp-family')
export class HPFamily extends LitElement {

  @property({type: String, reflect: true})
  public SurName: string;

  @property({reflect: true})
  public Members: string[];


  public constructor() {
    super();

  };

  protected render() {
    return html`
      <h4 class="h3">${this.SurName}</h4>
    `;
  };

}





