import {LitElement, html,} from 'lit';
import type {PropertyValues, TemplateResult} from 'lit'
import {property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import { withStores } from "@nanostores/lit";

import {task, onSet, onMount} from "nanostores";

import {TailwindMixin} from "../tailwind.element";

import {zodData,  primaryId, fetchData } from './state';

import {type Quality,
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
  type Export,
    ExportSchema,
    DatabaseSchema
} from '@lib/GrampsZodTypes';

// @ts-ignore
import styles from  '@styles/Gramps.css?inline';

import {IndividualName} from './individualName';
import {SimpleIndividual} from "./simpleIndividual";
import {GrampsEvent} from "./events";
import {AncestorsTreeChart} from './AncestorsTreeChart'

const DEBUG = false; 

export class GrampsIndividual extends TailwindMixin(withStores(LitElement, [primaryId, zodData]), styles) {

  @property({type: String})
  public personId: string;

  @state()
  private individual: Person |  null;

  constructor() {
    super();

    this.individual = null;
    this.personId = '';

      }

  public willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties)
    if (DEBUG) console.log(`willUpdate; id is ${this.personId}`)
    if(changedProperties.has('personId')) {
      if (DEBUG) console.log(`${typeof this.personId}`)
      if( this.personId !== undefined && this.personId.length > 0 ) {
        if (DEBUG) console.log(`calling setIndividual for ${this.personId}`)
        this.setIndividual();
      }
    }
  }




  private setIndividual() {
    if(primaryId && this.personId.length > 0 ) {
      const personUrl = new URL('/gramps/'.concat(this.personId).concat('.json'),import.meta.url);
      if (DEBUG) console.log(`setIndividual; url is ${personUrl.toString()}`)
      onSet(primaryId,() => {
        if (DEBUG) console.log(`setIndividual onSet; personUrl is ${personUrl.toString()}`)
        task(async () => {
          const status = await fetchData(personUrl);
          if(status) {
            const db = zodData.get();
            if(db) {
              const found = db.people.person.filter((p) => {
                if(p) {
                  return (!p.id.localeCompare(this.personId, undefined, {sensitivity: 'base'}))
                }
              })
              if(found) {
                const first: Person | undefined = [found].flat().shift();
                if(first !== undefined) {
                  this.individual = first;
                }
              }
            }
          }
        })
      });
      primaryId.set(this.personId);
    }
  }

  private renderGeneral(individual: Person) {
    return  html`
      <ul class="my-0">
        <li>Birth: <gramps-event grampsId=${this.personId} showBirth ></gramps-event></li>
        <li>Death: <gramps-event grampsId=${this.personId} showDeath ></gramps-event></li>
      </ul>
      
    `;
  };

  private renderParents(individual: Person) {
    if (DEBUG) console.log(`renderParents; starting`)
    let t = html``;
    if(individual) {
      if(zodData ) {
        const db: Database | null = zodData.get();
        if(db) {
          if (DEBUG) console.log(`renderParents; indivudal and controller set`)
          const family: Family | undefined | null = [this.getFamilyAsChild()].flat().shift();
          if(family !== null && family !== undefined) {
            if (DEBUG) console.log(`renderParents; family found`)
            let f = html``
            let m = html``
            const fatherLink = family.father ? family.father.hlink : null;
            if(fatherLink) {
              if (DEBUG) console.log(`renderParents; looking for father`)
              const father = db.people.person.filter(p => {
                return (!p.handle.localeCompare(fatherLink))
              }).shift();
              if(father) {
                if (DEBUG) console.log(`renderParents; found father with id ${father.id}`)
                f = html`<simple-individual grampsId=${father.id} asLink showBirth showDeath asRange></simple-individual>`
              }
            }
            const momLink = family.mother ? family.mother.hlink : null;
            if(momLink) {
              const mom = db.people.person.filter(p => {
                return (!p.handle.localeCompare(momLink))
              }).shift()
              if(mom) {
                m = html`<simple-individual grampsId=${mom.id} asLink showBirth showDeath asRange></simple-individual>`
              }
            }
            if(fatherLink || momLink) {
              t = html`${t}
            <h4 class="my-0">Parents</h4>
            <ul class="my-0">
              <li>Father: ${f}</li>
              <li>Mother: ${m}</li>
            </ul>
          `
            } else {
              if (DEBUG) console.log(`renderParents; family detected but no parent found at all`)
            }
          }
        }
      }

    }
    return html`${t}`;
  };

  private renderSiblings(individual: Person) {
    if (DEBUG) console.log(`renderSiblings; start`)
    let t = html``
    let c_template = html``;
    if(this.individual !== null && this.individual !== undefined) {
      if (zodData) {
        const db: Database | null = zodData.get();
        if(db) {
          if (DEBUG) console.log(`renderSiblings; indivudal ${this.individual.id} and controller set`)
          const families: Family[] | null = this.getFamilyAsChild();
          if(families !== null && families.length > 0) {
            families.map((f) => {
              if(f.childref) {
                const allChildren: (string | undefined)[] = [f.childref].flat().map(cr => {
                  if(cr) {
                    return cr.hlink;
                  }
                });
                if(allChildren !== null && allChildren !== undefined && allChildren.length > 0) {
                  if (DEBUG) console.log(`renderSiblings; ${allChildren.length} to look through`)
                  allChildren.map((cr) => {
                    if(cr !== undefined) {
                      if (DEBUG) console.log(`renderSiblings; child with handle ${cr} is real`)
                      const child: Person | undefined = db.people.person.filter((p) => {
                        if(p && p.handle) {
                          if (DEBUG) console.log(`renderSiblings; comparing against ${p.handle}`)
                          return (!p.handle.localeCompare(cr, undefined, {sensitivity: 'base'}))
                        }
                        return false;
                      }).shift();
                      if(child !== undefined && (child.id.localeCompare( this.personId, undefined, {sensitivity: 'base'}))) {
                        if (DEBUG) console.log(`renderSiblings; templating child ${child.id}`);
                        c_template = html`${c_template}
                        <li>
                          <simple-individual grampsId=${child.id} asLink showBirth showDeath asRange></simple-individual>
                        </li>
                        `
                      }
                    }
                  })
                }
              }
            })
            if(c_template.toString().length > 0) {
              t = html`
                  <h4 class="my-0">Siblings (and Half-Siblings)</h4>
                  <ul class="my-0">
                    ${c_template}
                  </ul>
                `
            }
          }
        }
      }
    }
    return html`${t}`
  }

  private renderUnion(f: Family ) {
    if (DEBUG) console.log(`renderUnion; start`)
    let t = html``
    if (this.individual) {
      if (zodData) {
        const db: Database | null = zodData.get();
        if(db) {
          if (DEBUG) console.log(`renderUnion; indivudal and controller set`)
          const ih = this.individual.handle;
          if(ih) {
            let hlink = ''
            if(f.mother && f.mother.hlink && ih.localeCompare(f.mother.hlink)) {
              //mother exists, and the person being rendered is NOT the mother
              hlink = f.mother.hlink;
            } else if (f.father && f.father.hlink && ih.localeCompare(f.father.hlink)) {
              //father exists and the person being rendered is NOT the father
              hlink = f.father.hlink;
            }
            const parent = db.people.person.filter((p) => {
              return (p.handle && (!p.handle.localeCompare(hlink)))
            }).shift();
            if (parent) {
              if (f.childref) {
                t = html`${t}With `
              }
              t = html`${t}<simple-individual grampsId=${parent.id} asLink showBirth showDeath asRange></simple-individual>`
            }
          }
          if(f.eventref) {
            const efh = f.eventref.hlink;
            const gme = db.events.event.filter((e) => {
              if(e && e.handle) {
                return (!e.handle.localeCompare(efh))
              }
            }).shift();
            t = html`${t} Married: <gramps-event familyId=${f.id} showMarriage simpleDate ></gramps-event>`
          }
          if(f.childref) {
            if (DEBUG) console.log(`renderUnion; starting search for children`)
            let crs:  Sourceref[] | Sourceref = f.childref;
            crs = [crs].flat();
            if (DEBUG) console.log(`renderUnion; I have ${crs.length} children`)
            t = html`${t}
          <ul class="my-0">
            ${crs.map((cr) => {
              let clink = cr.hlink;
              const c = db.people.person.filter((p) => {
                return (p.handle && (!p.handle.localeCompare(clink)))
              }).shift();
              if (c) {
                if (DEBUG) console.log(`renderUnion; found child ${c.id}`)
                return html`
                <li>
                  <simple-individual grampsId=${c.id} asLink showBirth showDeath asRange></simple-individual>
                </li>`
              }
            })}
          </ul>
          `

          }
        }
      }
    }
    return html`${t}`
  }

  private renderUnions(individual: Person){
    if (DEBUG) console.log(`renderUnions; starting`);
    let t = html``;
    if(individual){
      if(zodData) {
        const db: Database | null = zodData.get();
        if(db) {
          if (DEBUG) console.log(`renderUnions; indivudal and controller set`)
          const unions = this.getFamilyAsSpouse();
          if (unions) {
            if(unions.length === 0) {
              // apparently this can happen
              return null
            }
            t = html`${t} ${unions.length}`
            /*unions.sort((a, b) => {
              if(a) {}
            })*/
            return html`
          <h4 class="my-0">Unions & children</h4>
          <ul class="my-0">
          ${unions.map((u) => {
              return html`
                  <li>${this.renderUnion(u)}</li>
              `
            })}
          </ul>
          `

          }
        }
      }
    }
    return html`${t}`;
  }

  public getFamilyAsSpouse() {
    if (DEBUG) console.log(`getFamilyAsSpouse; starting`);
    let result = Array<Family>();
    if (zodData) {
      const db: Database | null = zodData.get();
      if( db) {
        if(this.personId && this.individual && this.individual.handle) {
          if (DEBUG) console.log(`getFamilyAsSpouse; with an individual`)
          result = db.families.family.filter((f) => {
            if(f.mother && f.mother.hlink) {
              if(!this.individual?.handle.localeCompare(f.mother.hlink)) {
                return true;
              }
            }
            if(f.father && f.father.hlink) {
              if(!this.individual?.handle.localeCompare(f.father.hlink)) {
                return true;
              }
            }
            return false;
          });
        }
      }
    }
    if(result.length > 0) {
      return result
    }
    return null;
  }

  public getFamilyAsChild() {
    if (DEBUG) console.log(`getFamilyAsChild; starting`)
    if (zodData) {
      const db: Database | null = zodData.get();
      if(db) {
        if(this.personId !== null && this.personId !== undefined) {
          if(this.individual !== null && this.individual !== undefined) {
            if (DEBUG) console.log(`getFamilyAsChild; with an individual ${this.individual.id}`)
            let result = Array<Family>();
            let familyRefs: (Sourceref | null)[] | null = (typeof this.individual.childof !== 'undefined')? [this.individual.childof].flat() : null;
            let familyLinks = Array<string>();
            if(familyRefs !== null && familyRefs.length > 0) {
              familyRefs.forEach(r => {
                if(r !== null) {
                  familyLinks.push(r.hlink);
                }
              })
              if (DEBUG) console.log(`getFamilyAsChild; I have ${familyLinks.length} links`);
              result = db.families.family.filter((f) => {
                const handle = f.handle;
                let r = Array<boolean>()
                familyLinks.forEach(l => {
                  if(!handle.localeCompare(l)) {
                    r.push(true);
                  }
                  r.push(false);
                })
                if(r.includes(true)) {
                  return true;
                }
                return false;
              })
            }
            if(result.length > 0) {
              if (DEBUG) console.log(`getFamilyAsChild; returning ${result.length} families`)
              return result;
            }
          }
        }
      }
    }
    return null;
  }

  public renderAncestorsCard () {
    if (DEBUG) console.log(`renderAncestorsCard; start`)
    const family = this.getFamilyAsChild();
    if(family && family.length > 0) {
      if (DEBUG) console.log(`renderAncestorsCard; family identified`)
      return html`
          <div class="AncestorsCard rounded border-2">
              <div class="CardBody">
                  <h4 class="my-0">
                    <iconify-icon icon="material-symbols:family-history-outline"></iconify-icon>
                      Ancestors chart
                  </h4>
                  <div class="flex basis-0 flex-col">
                      <div class="block sm:hidden">
                          <ancestorstree-chart grampsId=${this.personId} maxDepth="1" />
                      </div>
                      <div class="hidden sm:max-lg:block lg:hidden">
                          <ancestorstree-chart grampsId=${this.personId} maxDepth="2" />
                      </div>
                      <div class="hidden lg:block ">
                          <ancestorstree-chart grampsId=${this.personId} maxDepth="3" />
                      </div>
                  </div>
              </div>
          </div>
        `
    }
    return null;
  }

  private renderTimelineCard() {
    let t = html``
    if (zodData) {
      if (DEBUG) console.log(`renderTimelineCard; validated controller`)
      const db: Database | null = zodData.get();
      if (db) {
        if (this.personId && this.individual) {
          if(this.individual.eventref) {
            if (DEBUG) console.log(`renderTimelineCard; I have event refs`)
            const eventRefs: EventrefElement[] | EventrefElement = this.individual.eventref;
            const eRArray = [eventRefs].flat()
            if(eRArray.length > 0) {
              t = html`${t}
            <div class="TimelineCard rounded border-2">
              <div class="CardBody">
                <h4 class="my-0">
                  <iconify-icon icon="zondicons:calendar"></iconify-icon>
                  Events
                </h4>
                <ul class="timeline">
                  ${eRArray.map((er) => {
                const e = db.events.event.filter((e) => {
                  if(e && e.handle) {
                    return (!e.handle.localeCompare(er.hlink))
                  }
                  return false;
                }).shift();
                if(e) {
                  switch (e?.type) {
                    case 'Birth':
                      return html`
                            <li>
                              Birth: <gramps-event grampsId=${this.personId} showBirth></gramps-event>
                            </li>`;
                    case 'Death':
                      return html`
                            <li>
                              Death: <gramps-event grampsId=${this.personId} showDeath></gramps-event>
                            </li>`
                    case 'Marriage':
                      const f = this.getFamilyAsSpouse();
                      if (f && f.length > 0) {
                        return html`
                              <li>
                                Married: <gramps-event familyId=${f[0].id} showMarriage simpleDate></gramps-event>
                              </li>`
                      }
                    default:
                      if (DEBUG) console.log(`I do not handle ${e.type} yet`)
                  }
                }
              })}
                </ul>
              </div>
            </div>
            `
            }
          }
        }
      }
    }
    return html`${t}`
  }

  connectedCallback() {
    super.connectedCallback()

  }

  public render() {
    let t = html``
    if (zodData) {
      if (DEBUG) console.log(`render; validated controller`)
      const db: Database | null = zodData.get();
      if(db) {
        if (this.personId) {
          if (DEBUG) console.log(`render; and I have an id`)
          const filterResult = db.people.person.filter((v) => {
            return v.id === this.personId
          })
          if (filterResult && filterResult.length > 0) {
            if (DEBUG) console.log(`render; filter returned people`)
            const first = filterResult.shift();
            if (first) {
              if (DEBUG) console.log(`render; and the first was valid`);
              this.individual = first;
              t = html`
              <div class="flex-auto gap-1  ">
              <div class="flex-auto ">
                  <div class="grid grid-cols-12 grid-rows-2 bg-gray-100">
                      <div class="col-span-11 col-end-12 row-span-1 ">
                          <individual-name grampsId="${this.personId}"></individual-name>
                      </div>
                      <div class="col-span-1 row-span-1">
                          <button-menu></button-menu>
                      </div>
                      <div class="col-span-1 row-span-1">
                          ${this.personId}
                      </div>
                  </div>
                  <div class="flex-auto basis-0 flex-col gap-0 rounded border-2 ">
                      <div class="General flex-auto flex-col ">
                          ${when(this.individual, () => this.renderGeneral(this.individual!))}
                      </div>
                      <div class="Parents flex-auto flex-col my-0 gap-0">
                          ${when(this.individual, () => this.renderParents(this.individual!))}
                      </div>
                      <div class="Unions flex-auto flex-col gap-0">
                          ${this.renderUnions(this.individual)}
                      </div>
                      <div class="Sibilings flex-auto flex-col">
                          ${this.renderSiblings(this.individual)}
                      </div>
                  </div>
              </div>
              ${this.renderAncestorsCard()}
              ${this.renderTimelineCard()}
          </div>
            `
            }
          }
        }
      }
    }
    return html`${t}`;
  }
}
if(!customElements.get('gramps-individual')) {
  customElements.define('gramps-individual', GrampsIndividual);
}

