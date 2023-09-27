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

  @state()
  private controllersReady: boolean

  constructor() {
    super();

    this.controllersReady = false;
    this.url = null;
    
  }
  
  public async willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties)
    console.log(`header willUpdate; url is ${this.url}`)
    if(this.url && (this.url.toString().localeCompare(this.grampsController.getUrl().toString()))) {
      console.log(`header willUpdate; setting grampsController url`)
      this.grampsController.setUrl(new URL(this.url));
    }
    if (this.grampsController && this.grampsController.grampsStoreController && this.grampsController.grampsStoreController.value) {
      this.controllersReady = true;
    } else {
      this.controllersReady = false;
    }

  }
  
  render() {
    if(this.controllersReady) {
      console.log(`grampsParser/index render; controllersReady is true`)
      const jObj = this.grampsController.grampsStoreController.value;
      if(jObj ) {
        console.log(`grampsParser/index render; confirm jObj set`)
        const k = Object.keys(jObj);
        let t = html``
        if(k.includes('people')) {
          const p = (jObj.people.person[0])
          t = html`${t}people: ${Object.keys(p)}`
        } else {
        }

        return html`${t}`
      }

    }
    return html``;
  }
}

customElements.define('genealogical-data', GenealogicalData);


