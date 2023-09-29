import {LitElement, html,} from 'lit';
import type {PropertyValues, TemplateResult} from 'lit'
import {property, state} from 'lit/decorators.js';

import {TailwindMixin} from "../tailwind.element";

import {grampsDataController} from './state';

import {
  type ChildrefElement,
  type PurpleChildref,
  type Database,
  type Family,
  type Person,
  type Noteref,
} from './GrampsTypes';

import style from '../../styles/Gramps.css?inline';

import {IndividualName} from './individualName';
import {GrampsEvent} from "./events";
import {SimpleIndividual} from "./simpleIndividual";


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
  
  private renderGeneral(individual: Person) {
    return  html`
      <ul class="my-0">
        <li>Birth: <gramps-event grampsId=${this.grampsId} showBirth ></gramps-event></li>
        <li>Death: <gramps-event grampsId=${this.grampsId} showDeath ></gramps-event></li></li>
      </ul>
      
    `;
  };

  private renderParents(individual: Person) {
    console.log(`individual renderParents; starting`)
    let t = html``;
    if(individual) {
      if(this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
        console.log(`individual renderParents; indivudal and controller set`)
        const db: Database = this.grampsController.parsedStoreController.value.database;
        const family = [this.getFamilyAsChild()].flat().shift();
        if(family) {
          console.log(`individual renderParents; family found`)
          let f = html``
          let m = html``
          const fatherLink = family.father?.hlink;
          if(fatherLink) {
            const father = db.people.person.filter(p => {
              return (!p.handle.localeCompare(fatherLink))
            }).shift();
            if(father) {
              f = html`<simple-individual grampsId=${father.id}></simple-individual>`
            }
          }

          t = html`${t}
            <h4 class="my-0">Parents</h4>
            <ul class="my-0">
              <li>Father: ${f}</li>
              <li>IndividualRich({individual: familyAsChild.getWife().getIndividualRecord(), noPlace: true})</li>
            </ul>
          `
        }
      }
    }
    return html`${t}`;
  };

  public getFamilyAsChild() {
    console.log(`individual getFamilyAsChild; starting`)
    if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
      const db: Database = this.grampsController.parsedStoreController.value.database;
      let result = Array<Family>();
      if (this.grampsId) {
        if (this.individual) {
          console.log(`individual getFamilyAsChild; with an individual`)
          let familyRefs: Noteref[] | Noteref | undefined = this.individual.childof;
          let familyLinks = Array<string>();
          if(familyRefs) {
            console.log(`individual getFamilyAsChild; found refs`);
            [familyRefs].flat().forEach(r => {
              familyLinks.push(r.hlink);
            })
          }
          console.log(`individual getFamilyAsChild; I have ${familyLinks.length} links`)
          result = db.families.family.filter((f) => {
            const handle = f.handle;
            let r = false;
            familyLinks.forEach(l => {
              if(!handle.localeCompare(l)) {
                r = true;
              }
            })
            return r;
          })
        }
      }
      if(result.length > 0) {
        return result
      }
    }
    return null;
  }

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
                      <div class="General flex-auto flex-col ">
                          ${this.renderGeneral(this.individual)}
                      </div>
                      <div class="Parents flex-auto flex-col my-0 gap-0">
                          ${this.renderParents(this.individual)}
                      </div>
                      <div class="Unions flex-auto flex-col gap-0">
                          this.renderUnions(this.individual)
                      </div>
                      <div class="Sibilings flex-auto flex-col">
                          this.renderSiblings(this.individual)
                      </div>
                      <div class="HalfSiblings flex-auto flex-col">
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
