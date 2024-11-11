import {LitElement, html, type PropertyValues} from 'lit';
import {property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';

import {TailwindMixin} from "../tailwind.element";

import {zodData, fetchData} from './state';

import {
  type Quality,
  type DatevalType,
  type EventType,
  type Role,
  type RelType,
  type Gender,
  type Derivation,
  type NameType,
  type RepositoryType,
  type UrlType,
  type Medium,
  type Xml,
  type Tag,
  type Tags,
  type Sourceref,
  type ReporefElement,
  type Source,
  type Sources,
  type Url,
  type Repository,
  type Repositories,
  type Pname,
  type Coord,
  type Placeobj,
  type Places,
  type Personref,
  type SurnameClass,
  type NameElement,
  type Address,
  type EventrefElement,
  type Person,
  type People,
  type Note,
  type Notes,
  type Researcher,
  type Created,
  type Header,
  type Rel,
  type PurpleChildref,
  type ChildrefElement,
  type Family,
  type Families,
  type EventDateval,
  type Datestr,
  type DaterangeClass,
  type Attribute,
  type Event,
  type Events,
  type CitationDateval,
  type Citation,
  type Citations,
  type Database,
  type Export, SourcerefSchema, DatabaseSchema
} from '@lib/GrampsZodTypes';

import styles from '../../styles/Gramps.css?inline';

import {AncestorsTreeChart} from './AncestorsTreeChart'
import {IndividualName} from './individualName';
import {GrampsEvent} from "./events";
import {SimpleIndividual} from "./simpleIndividual";
import {GrampsIndividual} from "./individual";
import {withStores} from "@nanostores/lit";
import {allTasks, task} from "nanostores";
import {util} from "zod";
import assertNever = util.assertNever;

const DEBUG = false;

type renderChildrenTreeProps = {
  family: Family,
  root: Person,
};

export class GrampsFamily extends TailwindMixin(withStores(LitElement,[zodData]), styles) {
  @property()
  public url: URL | string | null;

  @state()
  private _persons: Person[] | null;

  @state()
  private _name: string;

  private _renderedPersons: string[] ;

  constructor() {
    super();

    this._name = '';
    this.url = new URL('/gramps/gramps.json', document.URL );
    this._persons = null;
    this._renderedPersons = new Array<string>();
  }

  connectedCallback() {
    super.connectedCallback()
    if (DEBUG) console.log(`initial url is ${this.url}`)
    if(this.url instanceof URL) {
      fetchData(this.url);
    }

  }

  public async willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties)
    if (DEBUG) console.log(`willUpdate;`)
    if (!this._name) {
      this.setName();
    }

    if (!this._persons) {
      if (DEBUG) console.log(`persons is not set, setting up listener`)
      zodData.listen(() => {})
      await allTasks();
      if (DEBUG) console.log(`all tasks complete, calling getPersons`)
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
      if (DEBUG) console.log(`name set to ${this._name}`)
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
    const db = zodData.get();
    if (person && db) {
      const familyRef: Sourceref[] | Sourceref |null| undefined = person.parentin;
      if (familyRef) {
        const familyArray = [familyRef].flat();
        const familyLinks = familyArray.map((f) => {
          return f.hlink;
        });
        if(familyLinks.length > 0) {
          if (DEBUG) console.log(`getPersonsChildren; I have families to search`)
          const stage1 = db.people.person.filter((p) => {
            if (p && p.name) {
              return this.checkMatchingName(p);
            }
            return false;
          }); //only people with the right last name
          if (DEBUG) console.log(`getPersonsChildren; stage1 ${stage1 ? stage1.length : 0} people`)
          const stage2 = stage1.filter((p) =>{
            if(p && p.childof) {
              return true;
            } else  {
              return false;
            }
            return false;
          }); //only people who are children of *someone*
          if (DEBUG) console.log(`getPersonsChildren; stage2 ${stage2 ? stage2.length : 0} people`)
          const stage3 = stage2.filter((p) => {
            if(p && p.childof) {
              if (DEBUG) console.log(`getPersonsChildren stage3; p is a child`)
              const familyRef:Sourceref[] | Sourceref = p.childof;
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
          if (DEBUG) console.log(`getPersonsChildren; stage3 ${stage3 ? stage3.length : 0} people`)
          if(stage3 && stage3.length > 0) {
            if (DEBUG) console.log(`getPersonsChildren; returning ${stage3.length} people`)
            return stage3;
          }
          if (DEBUG) console.log(`getPersonsChildren; no families`)
        }
      }
    } else {
      console.error(`no controller`)
    }
    if (DEBUG) console.log(`found no people`)
    return null;
  }

  private getPersons() {
    const db = zodData.get();
    if (db) {
      if (DEBUG) console.log(`getPersons; controllers are set`)
      if (this._name && this._name !== '') {
        if (DEBUG) console.log(`getPersons; name is set`)
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
    const db = zodData.get();
    if(person ) {
      if(this._renderedPersons && this._renderedPersons.includes(person.id)) {
        return html``;
      }
      this._renderedPersons.push(person.id);
      if (db) {
        t = html``; //erase the temp content
        let family: Family | undefined;
        if(person.parentin) {
          if (DEBUG) console.log(`renderChildLine; person is a parent`)
          const citation: Sourceref[] | Sourceref = person.parentin;
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
                  if (DEBUG) console.log(`renderChildLine; map iteration ${p.id}`)
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
    return html`${when((zodData.get() && this._persons),
        () => {
      return html`
        <ul>
          ${this._persons!.map((p) => {
            if(p) {
              if (DEBUG) console.log(`render; map iteration ${p.id}`)
              return html`${this.renderChildLine(p)}`
            }
          })}
        </ul>
      `
    }, () => html`Pending Data`)}`
  }

}

customElements.define('gramps-family', GrampsFamily);
