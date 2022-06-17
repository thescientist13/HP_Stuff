import {LitElement, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {guard} from 'lit/directives/guard.js';
import {when} from 'lit/directives/when.js';
import {html, literal} from 'lit/static-html.js';

import { readGedcom } from 'read-gedcom';
import * as rgs from 'read-gedcom';


@customElement('hp-gc')
class HPGC extends LitElement {
  tag = literal`hp-gc`;

  @state()
  protected _myGedFile: ArrayBuffer;
  
  @state()
  protected _myGedData: rgc.SelectionGedcom;

  @property({type: String, reflect: true})
  public myGedUrl: string;

  public constructor() {
    super();
		if(typeof(this.myGedUrl) !== 'undefined') {
			this.loadGedCom();
		} else {
			console.log('url undefined, need to figure out how to set it');
		}
  };

  private setGedUrl(url: string) {
    this.myGedUrl = url;
    if((typeof(this.myGedUrl) !== 'undefined') && (this.myGedUrl !== '')) {
      this.loadGedCom();
    } else {
      console.log('setGedUrl called with ' + url);
    }
    return this.myGedUrl;
  };

	private loadGedCom() {
		
    if((typeof(this.myGedUrl) !== 'undefined') && (this.myGedUrl !== '')) {
      console.log(`loadGedCom called for ${this.myGedUrl}`);
      const GedPromise = fetch(this.myGedUrl)
      .then(response => response.arrayBuffer())
      .then(readGedcom);

      GedPromise.then(gedc => {
        console.log(gedc.getHeader().toString());
        this.my_GedData = gedc;
        dispatchEvent(new CustomEvent('GedLoaded'));
      });
    } else {
      console.log('loadGedCom called before myGedUrl is set');
    }
  };

  protected render() {
    return html`
    <div .myGedUrl=${guard([this.myGedUrl], () => this.setGedUrl(this.myGedUrl))} >
      <slot name="hpgc-main"></slot>
    </div>
    `;
  };

}

// vim: shiftwidth=2:tabstop=2:expandtab

