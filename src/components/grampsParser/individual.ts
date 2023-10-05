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
} from './GrampsTypes';

import style from '../../styles/Gramps.css?inline';

import {AncestorsTreeChart} from './AncestorsTreeChart'
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
    console.log(`willUpdate; url is ${this.url}`)
    const u = this.grampsController.getUrl();
    if (this.url && (!u || (u && (this.url.toString().localeCompare(u.toString()))))) {
      console.log(`willUpdate; setting grampsController url`)
      this.grampsController.setUrl(new URL(this.url));
    }
  }

  private renderGeneral(individual: Person) {
    return  html`
      <ul class="my-0">
        <li>Birth: <gramps-event grampsId=${this.grampsId} showBirth ></gramps-event></li>
        <li>Death: <gramps-event grampsId=${this.grampsId} showDeath ></gramps-event></li>
      </ul>
      
    `;
  };

  private renderParents(individual: Person) {
    console.log(`renderParents; starting`)
    let t = html``;
    if(individual) {
      if(this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
        console.log(`renderParents; indivudal and controller set`)
        const db: Database = this.grampsController.parsedStoreController.value.database;
        const family = [this.getFamilyAsChild()].flat().shift();
        if(family) {
          console.log(`renderParents; family found`)
          let f = html``
          let m = html``
          const fatherLink = family.father ? family.father.hlink : null;
          if(fatherLink) {
            const father = db.people.person.filter(p => {
              return (!p.handle.localeCompare(fatherLink))
            }).shift();
            if(father) {
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
            console.log(`renderParents; family detected but no parent found at all`)
          }
        }
      }
    }
    return html`${t}`;
  };

  private renderSiblings(individual: Person) {
    console.log(`renderSiblings; start`)
    let t = html``
    let c_template = html``;
    if(this.individual) {
      if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
        console.log(`renderUnion; indivudal and controller set`)
        const db: Database = this.grampsController.parsedStoreController.value.database;
        const families = this.getFamilyAsChild();
        if(families) {
          families.map((f) => {
            if(f.childref) {
              const allChildren = [f.childref].flat();

              allChildren.map((c) => {
                if(c) {
                  const child = db.people.person.filter((p) => {
                    const handle = p.handle;
                    if(handle) {
                      return (!handle.localeCompare(c.hlink))
                    }
                  }).shift();
                  if(child && (child.id !== this.grampsId)) {
                    c_template = html`${c_template}
                    <li>
                      <simple-individual grampsId=${child.id} asLink showBirth showDeath asRange></simple-individual>
                    </li>
                    `
                  }
                }
              })

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
    return html`${t}`
  }

  private renderUnion(f: Family ) {
    console.log(`renderUnion; start`)
    let t = html``
    if (this.individual) {
      if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
        console.log(`renderUnion; indivudal and controller set`)
        const db: Database = this.grampsController.parsedStoreController.value.database;
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
          console.log(`renderUnion; starting search for children`)
          let crs:  ChildrefElement[] | PurpleChildref = f.childref;
          crs = [crs].flat();
          console.log(`renderUnion; I have ${crs.length} children`)
          t = html`${t}
          <ul class="my-0">
            ${crs.map((cr) => {
            let clink = cr.hlink;
            const c = db.people.person.filter((p) => {
              return (p.handle && (!p.handle.localeCompare(clink)))
            }).shift();
            if (c) {
              console.log(`renderUnion; found child ${c.id}`)
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
    return html`${t}`
  }

  private renderUnions(individual: Person){
    console.log(`renderUnions; starting`);
    let t = html``;
    if(individual){
      if(this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
        console.log(`renderUnions; indivudal and controller set`)
        const db: Database = this.grampsController.parsedStoreController.value.database;
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
    return html`${t}`;
  }

  public getFamilyAsSpouse() {
    console.log(`getFamilyAsSpouse; starting`);
    let result = Array<Family>();
    if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
      const db: Database = this.grampsController.parsedStoreController.value.database;
      if(this.grampsId && this.individual && this.individual.handle) {
        console.log(`getFamilyAsSpouse; with an individual`)
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
    if(result.length > 0) {
      return result
    }
    return null;
  }

  public getFamilyAsChild() {
    console.log(`getFamilyAsChild; starting`)
    if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
      const db: Database = this.grampsController.parsedStoreController.value.database;
      let result = Array<Family>();
      if (this.grampsId) {
        if (this.individual) {
          console.log(`getFamilyAsChild; with an individual`)
          let familyRefs: Noteref[] | Noteref | undefined = this.individual.childof;
          let familyLinks = Array<string>();
          if(familyRefs) {
            console.log(`getFamilyAsChild; found refs`);
            [familyRefs].flat().forEach(r => {
              familyLinks.push(r.hlink);
            })
          }
          console.log(`getFamilyAsChild; I have ${familyLinks.length} links`)
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

  public renderAncestorsCard () {
    console.log(`renderAncestorsCard; start`)
    const family = this.getFamilyAsChild();
    if(family && family.length > 0) {
      console.log(`renderAncestorsCard; family identified`)
      return html`
          <div class="AncestorsCard rounded border-2">
              <div class="CardBody">
                  <h4 class="my-0">
                    <iconify-icon icon="material-symbols:family-history-outline"></iconify-icon>
                      Ancestors chart
                  </h4>
                  <div class="flex basis-0 flex-col">
                      <div class="block sm:hidden">
                          <ancestorstree-chart grampsId=${this.grampsId} maxDepth="1" />
                      </div>
                      <div class="hidden sm:max-lg:block lg:hidden">
                          <ancestorstree-chart grampsId=${this.grampsId} maxDepth="2" />
                      </div>
                      <div class="hidden lg:block ">
                          <ancestorstree-chart grampsId=${this.grampsId} maxDepth="3" />
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
    if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
      console.log(`renderTimelineCard; validated controller`)
      const db: Database = this.grampsController.parsedStoreController.value.database;
      if (this.grampsId && this.individual) {
        if(this.individual.eventref) {
          console.log(`renderTimelineCard; I have event refs`)
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
                              Birth: <gramps-event grampsId=${this.grampsId} showBirth></gramps-event>
                            </li>`;
                        case 'Death':
                          return html`
                            <li>
                              Death: <gramps-event grampsId=${this.grampsId} showDeath></gramps-event>
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
                          console.log(`I do not handle ${e.type} yet`)
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
    return html`${t}`
  }

  public render() {
    let t = html``
    if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
      console.log(`render; validated controller`)
      const db: Database = this.grampsController.parsedStoreController.value.database;
      if (this.grampsId) {
        console.log(`render; and I have an id`)
        const filterResult = db.people.person.filter((v) => {
          return v.id === this.grampsId
        })
        if (filterResult && filterResult.length > 0) {
          console.log(`render; filter returned people`)
          const first = filterResult.shift();
          if (first) {
            console.log(`render; and the first was valid`);
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

    return html`${t}`;
  }

}

customElements.define('gramps-individual', GrampsIndividual);
