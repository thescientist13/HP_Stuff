import {LitElement, html,} from 'lit';
import type {PropertyValues, TemplateResult} from 'lit'
import {property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';

import {TailwindMixin} from "../tailwind.element";

import {grampsDataController} from './state';

import {
  type ChildrefElement,
  type Event,
  type EventType,
  type Database,
  type Family,
  type Person,
  type PurpleChildref,
  type Noteref,
  type EventrefElement,
  type NameElement,
  type SurnameClass,
} from './GrampsTypes';

import style from '../../styles/Gramps.css?inline';

import {AncestorsTreeChart} from './AncestorsTreeChart'
import {IndividualName} from './individualName';
import {GrampsEvent} from "./events";
import {SimpleIndividual} from "./simpleIndividual";
import {GrampsIndividual} from "./individual";

type renderChildrenTreeProps = {
  family: Family,
  root: Person,
};

export class GrampsFamily extends TailwindMixin(LitElement, style) {
  @property()
  public url: URL | string | null;
  
  private grampsController = new grampsDataController(this);
  
  @state()
  private _persons: Person[] | null;
  
  @state()
  private _name: string;

  private _renderedPersons: string[] ;
  
  constructor() {
    super();
    
    this._name = ''
    this.url = null;
    this._persons = null;
    this._renderedPersons = new Array<string>();
  }
  
  public async willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties)
    console.log(`willUpdate; url is ${this.url}`)
    const u = this.grampsController.getUrl();
    if (this.url && (!u || (u && (this.url.toString().localeCompare(u.toString()))))) {
      console.log(`willUpdate; setting grampsController url`)
      this.grampsController.setUrl(new URL(this.url));
    }
    if(this.url && !this._name) {
      this.setName();
    }
  
    if(!this._persons) {
      this.getPersons();
    }
  }
  
  private setName() {
    const u = new URL(document.URL);
    const path = u.pathname;
    let name = '';
    if (path[path.length - 1] === '/') {
      const a = path.split('/');
      name = a[a.length - 2]
    } else {
      const a = path.split('/');
      name = a[a.length - 1]
    }
    if (name !== '') {
      this._name = name;
      console.log(`name set to ${this._name}`)
    }
  }

  private checkMatchingName(person: Person) {
    if(person && person.name) {
      const nameParts: NameElement[] | NameElement = person.name;
      const last = [nameParts].flat().map((n) => {
        const s: SurnameClass | string = n.surname;
        if (typeof s === 'string') {
          return s.toLowerCase();
        } else {
          return s['#text'].toLowerCase();
        }
      })
      return last.includes(this._name.toLowerCase());
    }
    return false;
  }

  private getPersonsChildren(person: Person) {
    if (person && this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
      const db = this.grampsController.parsedStoreController.value.database;
      const familyRef: Noteref[] | Noteref | undefined = person.parentin;
      if (familyRef) {
        const familyArray = [familyRef].flat();
        const familyLinks = familyArray.map((f) => {
          return f.hlink;
        });
        if(familyLinks.length > 0) {
          console.log(`getPersonsChildren; I have families to search`)
          const stage1 = db.people.person.filter((p) => {
            if (p && p.name) {
              return this.checkMatchingName(p);
            }
            return false;
          }); //only people with the right last name
          console.log(`getPersonsChildren; stage1 ${stage1 ? stage1.length : 0} people`)
          const stage2 = stage1.filter((p) =>{
            if(p && p.childof) {
              return true;
            } else  {
              return false;
            }
            return false;
          }); //only people who are children of *someone*
          console.log(`getPersonsChildren; stage2 ${stage2 ? stage2.length : 0} people`)
          const stage3 = stage2.filter((p) => {
            if(p && p.childof) {
              console.log(`getPersonsChildren stage3; p is a child`)
              const familyRef:Noteref[] | Noteref = p.childof;
              const childFamArray = [familyRef].flat()
              const childLinks = childFamArray.map((c) => {
                return c.hlink;
              }); //this should be only children of the right parent.
              // I need *at least* blocks one and three because otherwise I end up grabbing children of marriages who really belong on other pages
              const results = childLinks.filter(x => familyLinks.includes(x))
              if (results.length > 0) {
                return true;
              }
            }
            return false;
          });
          console.log(`getPersonsChildren; stage3 ${stage3 ? stage3.length : 0} people`)
          if(stage3 && stage3.length > 0) {
            console.log(`getPersonsChildren; returning ${stage3.length} people`)
            return stage3;
          }
          console.log(`getPersonsChildren; no families`)
        }
      }
    } else {
      console.error(`no controller`)
    }
    console.log(`found no people`)
    return null;
  }

  private getPersons() {
    if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
      console.log(`getPersons; controllers are set`)
      if (this._name && this._name !== '') {
        console.log(`getPersons; name is set`)
        const db = this.grampsController.parsedStoreController.value.database;
        const people = db.people.person.filter((p) => {
          if (p && p.name) {
            return this.checkMatchingName(p);
          }
          return false;
        }).filter((p) =>{
          if(p && p.childof) {
            return false;
          } else if (p) {
            return true;
          }
          return false;
        });
        if(people && people.length > 0) {
          this._persons = people;
          return people;
        }
      }
    }
    return null;
  }
  
  private renderChildLine(person: Person) {
    let t = html`No Child`
    if(person ) {
      if(this._renderedPersons && this._renderedPersons.includes(person.id)) {
        return html``;
      }
      this._renderedPersons.push(person.id);
      if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
        t = html``; //erase the temp content
        const db = this.grampsController.parsedStoreController.value.database;
        let family: Family | undefined;
        if(person.parentin) {
          console.log(`renderChildLine; person is a parent`)
          const citation:Noteref[] | Noteref = person.parentin;
          const cArray = [citation].flat();
          family = db.families.family.filter((f) => {
            if(f && f.handle) {
              const links = cArray.map((c) => {
                return c.hlink;
              })
              return (links.includes(f.handle))
            }
            return false;
          }).shift();
          if(family && family.childref) {
            const children = this.getPersonsChildren(person);
            if(children) {
              t = html`${t}
              <uL>
                ${children.map((p) => {
                  console.log(`renderChildLine; map iteration ${p.id}`)
                  return html`${this.renderChildLine(p)}`
                })}
              </uL>
              `
            }
          }
        }
        t = html`
          <li>
            <simple-individual grampsId=${person.id} asLink showBirth showDeath asRange></simple-individual>
            ${t}
          </li>
        `
      }
    }
    return html`${t}`
  }

  render() {
    return html`${when((this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value && this._persons),
        () => {
      return html`
        <ul>
          ${this._persons!.map((p) => {
            if(p) {
              console.log(`render; map iteration ${p.id}`)
              return html`${this.renderChildLine(p)}`
            }
          })}
        </ul>
      `
    }, () => html`Pending Data`)}`
  }
  
}

customElements.define('gramps-family', GrampsFamily);
