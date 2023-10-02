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
  
  constructor() {
    super();
    
    this._name = ''
    this.url = null;
    this._persons = null;
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
  
  private getPersons() {
    if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
      console.log(`getPersons; controllers are set`)
      if (this._name && this._name !== '') {
        console.log(`getPersons; name is set`)
        const db = this.grampsController.parsedStoreController.value.database;
        const people = db.people.person.filter((p) => {
          if (p && p.name) {
            const nameParts: NameElement[] | NameElement = p.name;
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
      return null;
    }
  }
  
  private renderChildrenTree(props: renderChildrenTreeProps ) {
    console.log(`renderUnion; start`)
    let t = html``
    
      if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
        console.log(`renderUnion; controller set`)
        const db: Database = this.grampsController.parsedStoreController.value.database;
        
        const {family, root } = props;
        const familyLink = family.handle;
        const children = db.people.person.filter((p) => {
          if(p && p.childof) {
            const famRef: Noteref[] | Noteref = p.childof;
            const famRefA = [famRef].flat().map((h) => {
              return h.hlink;
            });
            return famRefA.includes(familyLink);
          }
        })
        if(children && children.length > 0) {
          console.log(`renderChildrenTree; I have ${children.length} children to show`)
          let childT = html``;
          children.forEach((c) => {
            if(c) {
              if(c.name && c.parentin) {
                let childT = html``;
                console.log(`I may need to recurse ${c.id}`)
                const nameParts: NameElement[] | NameElement = c.name;
                const nameArray = [nameParts].flat();
                const last = nameArray.map((s) => {
                  if(s.surname) {
                    if(typeof  s.surname === 'string') {
                      if(!s.surname.toLowerCase().localeCompare(this._name.toLowerCase())) {
                        return true;
                      }
                    } else {
                      if(!s.surname['#text'].toLowerCase().localeCompare(this._name.toLowerCase())) {
                        return true;
                      }
                    }
                  }
                  return false;
                }).includes(true);
                if(last) {
                  console.log(`I need to recurse ${c.id}`)
                  const p2Ref:Noteref[] | Noteref = c.parentin;
                  const p2A = [p2Ref].flat();
                  p2A.forEach((fam2R) => {
                    const fam = db.families.family.filter((f) => {
                      if(f && f.handle) {
                        return (!f.handle.localeCompare(fam2R.hlink))
                      }
                    }).shift();
                    if(fam && fam.childref) {
                      console.log(`recursing into family ${fam.id}`)
                      childT = html`${childT}${this.renderChildrenTree({family: fam, root: c})}`
                    }
                  })
                }
              }
            }
            t = html`${t}
                    <li>
                        <simple-individual grampsId=${c.id} asLink showBirth showDeath asRange></simple-individual>
                        <ul>${childT}</ul>
                    </li>
            `
          })
        }
      }
    
    return html`${t}`
  }
  
  render() {
    let t = html``
    if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
      const db = this.grampsController.parsedStoreController.value.database;
      if(this._persons) {
        console.log(`render; I have persons`)
        t = html`
            <uL>
                ${this._persons?.map((p) => {
                  if(p) {
                    console.log(`render persons map; p was set`)
                    let childT = html``;
                    if(p.parentin) {
                      const famRef = p.parentin;
                      const famA = [famRef].flat();
                      famA.forEach((famR) => {
                        const hlink = famR.hlink;
                        const fam = db.families.family.filter((f) => {
                          if(f && f.handle) {
                            return (!f.handle.localeCompare(hlink))
                          }
                        }).shift();
                        if(fam && fam.childref) {
                          childT = html`${childT}${this.renderChildrenTree({family: fam, root: p})}`
                        }
                      });
                      childT = html`<ul>${childT}</ul>`
                    }
                    return html`
                    <li>
                        <simple-individual grampsId=${p.id} asLink showBirth showDeath asRange></simple-individual>
                        ${childT}
                    </li>
                    `
                  }
                })}
            </uL>
        `
      } else {
        console.log(`I had no persons`)
        this.getPersons();
        this.requestUpdate();
      }
    } else {
      t = html`Pending data`
    }
    return html`${t}`
  }
  
}

customElements.define('gramps-family', GrampsFamily);
