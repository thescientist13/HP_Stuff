import {LitElement, html,} from 'lit';
import type {PropertyValues, TemplateResult} from 'lit'
import {property, state} from 'lit/decorators.js';

import {TailwindMixin} from "../tailwind.element";

import {grampsDataController} from './state';

import {type Database, type Person} from './GrampsTypes';

import style from '../../styles/Gramps.css?inline';

import {IndividualName} from './individualName';
import {SelectionIndividualRecord} from "read-gedcom";

export class GrampsIndividual extends TailwindMixin(LitElement, style) {
  
  @property()
  public url: URL | string | null;
  
  @property({type: String})
  public grampsId: string;
  
  @state()
  private individual: Person |  null;
  
  private grampsController = new grampsDataController(this);
  
  constructor() {
    super();
    
    this.url = null;
    this.individual = null;
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
  
  private renderGeneral(individual: SelectionIndividualRecord) {
    return  html`
      <ul class="my-0">
        <li>Birth: <individual-events gedId=${this.gedId} showBirth ></individual-events></li>
        <li>Death: <individual-events gedId=${this.gedId} showDeath ></individual-events></li>
      </ul>
      
    `;
  };
  
  public render() {
    let t = html``
    if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
      console.log(`grampsIndividual render; validated controller`)
      const db: Database = this.grampsController.parsedStoreController.value.database;
      if (this.grampsId) {
        console.log(`grampsIndividual render; and I have an id`)
        const filterResult = db.people.person.filter((v) => {
          return v.id === this.grampsId
        })
        if (filterResult && filterResult.length > 0) {
          console.log(`grampsIndividual render; filter returned people`)
          const first = filterResult.shift();
          if (first) {
            console.log(`grampsIndividual render; and the first was valid`);
            this.individual = first;
            t = html`
              <div class="flex-auto gap-1  ">
              <div class="flex-auto ">
                  <div class="grid grid-cols-12 grid-rows-2 bg-gray-100">
                      <div class="col-span-11 col-end-12 row-span-1 ">
                          <individual-name grampsId="${this.grampsId}"></individual-name>
                      </div>
                      <div class="col-span-1 row-span-1">
                          <button-menu></button-menu>
                      </div>
                      <div class="col-span-1 row-span-1">
                          ${this.grampsId}
                      </div>
                  </div>
                  <div class="flex-auto basis-0 flex-col gap-0 rounded border-2 ">
                      <div class="flex-auto flex-col ">
                          ${this.renderGeneral(this.individual)}
                      </div>
                      <div class="flex-auto flex-col my-0 gap-0">
                          this.renderParents(this.individual)
                      </div>
                      <div class="flex-auto flex-col gap-0">
                          this.renderUnions(this.individual)
                      </div>
                      <div class="flex-auto flex-col">
                          this.renderSiblings(this.individual)
                      </div>
                      <div class="flex-auto flex-col">
                          this.renderHalfSiblings(this.individual)
                      </div>
                  </div>
              </div>
              this.renderAncestorsCard(this.individual)
              this.renderTimelineCard(this.individual)
          </div>
            `
          }
        }
      }
    }
    
    return html`${t}`;
  }
  
}

customElements.define('gramps-individual', GrampsIndividual);
