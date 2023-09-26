import {LitElement, html,} from 'lit';
import type {PropertyValues, TemplateResult} from 'lit'
import {property, state} from 'lit/decorators.js';

import {TailwindMixin} from "../tailwind.element";

import {grampsDataController} from './state';

import style from '../../styles/Gramps.css?inline';


export class grampsIndividual extends TailwindMixin(LitElement, style) {
  
  @property()
  public url: URL | string | null;
  
  @property({type: String})
  public grampsId: string;
  
  @state()
  private individual
  
  private grampsController = new grampsDataController(this);
  
  constructor() {
    super();
    
    this.url = null;
    this.grampsId = '';
    
  }
  
  public async willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties)
    console.log(`grampsIndividual willUpdate; url is ${this.url}`)
    if (this.url && (this.url.toString().localeCompare(this.grampsController.getUrl().toString()))) {
      console.log(`grampsIndividual willUpdate; setting grampsController url`)
      this.grampsController.setUrl(new URL(this.url));
    }
  }
  
  public render(){
    if(this.grampsController && this.grampsController.grampsStoreController && this.grampsController.grampsStoreController.value) {
      if(this.grampsId) {
        this.individual = this.grampsController.grampsStoreController.value.xml.people.
      }
    }
    return html``;
  }
  
}
customElements.define('gramps-individual', grampsIndividual);
