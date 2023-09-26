import {LitElement, html,} from 'lit';
import type {PropertyValues, TemplateResult} from 'lit'
import {property, state} from 'lit/decorators.js';

import {TailwindMixin} from "../tailwind.element";

import {grampsDataController} from './state';

import style from '../../styles/Gramps.css?inline';


export class GenealogicalData extends TailwindMixin(LitElement, style) {
  
  @property()
  public url: URL | string | null;
  
  private grampsController = new grampsDataController(this);
  
  constructor() {
    super();
    
    this.url = null;
    
  }
  
  public async willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties)
    console.log(`header willUpdate; url is ${this.url}`)
    if(this.url && (this.url.toString().localeCompare(this.grampsController.getUrl().toString()))) {
      console.log(`header willUpdate; setting grampsController url`)
      this.grampsController.setUrl(new URL(this.url));
    }
  }
  
  render() {
    if (this.grampsController && this.grampsController.grampsStoreController && this.grampsController.grampsStoreController.value) {
      return html`
          <pre>
              ${JSON.stringify(this.grampsController.grampsStoreController.value.database.people.person, null, 2)}
          </pre>
          
      `
    }
    
  }
}

customElements.define('genealogical-data', GenealogicalData);


