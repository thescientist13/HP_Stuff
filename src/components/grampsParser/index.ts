import {LitElement, html,} from 'lit';
import type {PropertyValues, TemplateResult} from 'lit'
import {property, state} from 'lit/decorators.js';

import {TailwindMixin} from "../tailwind.element";

import {grampsDataController} from './state';

import style from '../../styles/Gramps.css?inline';

import {type Export } from './GrampsTypes.ts';

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
    if(this.grampsController) {
      const currentUrl = this.grampsController.getUrl();
      if(this.url && ((currentUrl && (currentUrl.toString().localeCompare(this.url.toString()))) || !currentUrl)) {
        console.log(`header willUpdate; setting grampsController url`)
        this.grampsController.setUrl(new URL(this.url));
      }
    }
    
    if (this.grampsController && this.grampsController.grampsStoreController && this.grampsController.grampsStoreController.value) {
      if(this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
        this.controllersReady = true;
      } else {
        this.controllersReady = false;
      }
    } else {
      this.controllersReady = false;
    }

  }
  
  render() {
    if(this.controllersReady) {
      console.log(`grampsParser/index render; controllersReady is true`)
      const pObj: Export | null = this.grampsController.parsedStoreController.value;
      let t = html``
      if(pObj) {
        console.log(`grampsParser/index render; confirmed I have parsed data`)
        t = html`${t}Gramps Data exported ${pObj.database.header.created.date.toDateString()}<br/>`
        const psize = pObj.database.people.person.length;
        t = html`${t}There are ${psize} people<br/>`;
        const fsize = pObj.database.families.family.length;
        t = html`${t}There are ${fsize} families<br/>`;
        const esize = pObj.database.events.event.length;
        t = html`${t}There are ${esize} events<br/>`;
      }
      return html`${t}`
    }
    return html``;
  }
}

customElements.define('genealogical-data', GenealogicalData);


