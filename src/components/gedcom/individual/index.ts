import {LitElement, html, } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit'
import {property, state} from 'lit/decorators.js';

import { ValueEvent, type TreeNode, type SelectionIndividualRecord, type SelectionFamilyRecord, type SelectionAny, SelectionIndividualEvent, type SelectionEvent} from 'read-gedcom';

import { z } from "zod";


import {
  computeAncestors,
  computeDescendants,
  computeInbreedingCoefficient, computeRelated, computeRelatednessCoefficient,
  displayDate,
  displayName,
  isEventEmpty, setIntersectionSize,
} from '../util';

import {TailwindMixin} from "../../tailwind.element";
import { gedcomDataController, gcDataContext } from '../state/database';

import {ButtonMenu} from '../../ButtonMenu';
import { IndividualName } from './IndividualName'
import {IndividualEvents} from "./IndividualEvents";
import {IndividualRich, type IndividualRichParams} from "./IndividualRich";
import {AncestorsTreeChart} from "../AncestorsTreeChart";
import {Tag, eventsWithKeys} from '../tag';


import style from '../../../styles/Individual.css?inline';

export class GedcomIndividual extends TailwindMixin(LitElement, style) {
  
  @property()
  public url: URL | string | null;
  
  @property({type: String})
  public gedId: string;

  @state()
  public gcDataController = new gedcomDataController(this);
  
  @state()
  protected individual:  SelectionIndividualRecord | null;
  

  constructor() {
    super();
    this.individual = null;
    this.gedId = '';
    this.url = null;
    
  }
  
  public async willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties)
    console.log(`individual willUpdate; url is ${this.url}`)
    if(!this.gcDataController) {
      console.log(`individual willUpdate; no gcDataController`)
      return null;
    } else {
      if(this.url) {
        if (this.url.toString().localeCompare(this.gcDataController.getUrl().toString())) {
          console.log(`individual willUpdate; setting gedcomDataController url`)
          this.gcDataController.setUrl(new URL(this.url));
        }
        if(this.gcDataController.gedcomStoreController) {
          if(this.gcDataController.gedcomStoreController.value) {
            if(this.gedId && (this.gedId !== '')) {
              if(!this.individual) {
                console.log(`individual willUpdate; detected need to set this.individual`)
                const store = this.gcDataController.gedcomStoreController.value;
                this.individual = store.getIndividualRecord(this.gedId);
                if(typeof(this.individual) === 'string') {
                  console.log(`individual willUpdate; retrieved a string for the individual ${this.individual}`)
                } else {
                  console.log(`individual willUpdate; individual was ${this.individual.toString()}`)
                  this.requestUpdate();
                }
              } else {
                console.log(`individual willUpdate; individual already set`)
              }
            } else {
              console.log(`individual willUpdate; no gedId`)
            }
          } else {
            console.log(`individual willUpdate; no gedcomStoreController value`)
          }
        } else {
          console.log(`individual willUpdate; no gedcomStoreController`)
        }
      } else {
        console.log(`individual willUpdate; no url`)
      }
    }
  }
  
  private renderParents(individual: SelectionIndividualRecord) {
    const familyAsChild = individual.getFamilyAsChild(); // TODO filter adoptive
    return html`
                <h4 class="my-0">Parents</h4>
                <ul class="my-0">
                    <li>${IndividualRich({individual: familyAsChild.getHusband().getIndividualRecord(), noPlace: true})}</li>
                    <li>${IndividualRich({individual: familyAsChild.getWife().getIndividualRecord(), noPlace: true})}</li>
                </ul>
    `
  };
  
  private renderUnion(individual: SelectionIndividualRecord, family: SelectionFamilyRecord) {
    const otherRef = family.getHusband().value()[0] === individual[0].pointer ? family.getWife() : family.getHusband();
    const other = otherRef.getIndividualRecord();
    const marriage = family.getEventMarriage();
    const children = family.getChild().getIndividualRecord();
    const hadChildren = children.length > 0;
    let spouseData = html`
      ${IndividualRich({individual: other, noPlace: true})}
    `;
    if (marriage.length > 0) {
      console.log(`individual renderUnion; other.pointer is ${other.pointer()[0]}`)
      spouseData = html`
          ${spouseData}
          Married: <individual-events showMarriage gedId=${this.gedId} gedId2=${other.pointer()[0]}></individual-events>
      `
    }
    if (hadChildren) {
      return html`
          With ${spouseData}:
          <ul class="my-0">
              ${children.arraySelect().map((child: SelectionIndividualRecord, i: number) => {
                  return html`
                      <li>
                        ${IndividualRich({individual: child, noPlace: true})}
                      </li>`
              })}
          </ul>
      `
    } else {
      return spouseData;
    }
  }
  private renderUnions(individual: SelectionIndividualRecord, familiesFilter?: (s: SelectionAny) => boolean, title = true) {
    let familiesAsSpouse: SelectionFamilyRecord | null = null;
    if(familiesFilter) {
      familiesAsSpouse = individual.getFamilyAsSpouse().filterSelect(familiesFilter);
    } else {
      familiesAsSpouse = individual.getFamilyAsSpouse();
    }
    const orderIfSpecified = individual.getSpouseFamilyLink().value();
    let ordered: any[] = [];
    if (familiesAsSpouse &&  familiesAsSpouse.length === 0) {
      return null;
    } else {
      // Sort the families in the order of the FAMS tags (rather than in the order of their ids)
      const available = Object.fromEntries(familiesAsSpouse.arraySelect().map(family => [family[0].pointer, family]));
      const processed = new Set();
      
      orderIfSpecified.forEach(id => {
        if (!processed.has(id)) { // Weird but could happen
          if (id) {
            const family = available[id];
            if (family) {
              ordered.push(family);
              processed.add(id);
            }
          }
        }
      });
      Object.entries(available).forEach(([id, family]) => {
        if (!processed.has(id)) {
          ordered.push(family);
        }
      });
      return html`
          <h4 class="my-0">Unions & children</h4>
          <ul class="my-0">
          ${ordered.map((family, i) => {
              return html`
                  <li>${this.renderUnion(individual, family)}</li>
              `
          })}
          </ul>
      `
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
  
  private renderSiblings (individual: SelectionIndividualRecord){
    const siblings = individual.getFamilyAsChild().getChild().getIndividualRecord().filter(s => s.pointer !== individual[0].pointer);
    if (siblings.length === 0) {
      return null;
    } else {

      return html`
          <h4 class="my-0">Siblings</h4>
          <ul class="my-0">
              ${siblings.filter(child => child.pointer !== individual[0].pointer).arraySelect().map((child, i) => {
                const params: IndividualRichParams = {individual: child, simpleDate: true, simpleRange: true};
                return html`<li >${IndividualRich(params)}</li>`;
              })}
          </ul>
      `;
    }
  };
  
  private renderHalfSiblingSide (individual: SelectionIndividualRecord, parent: SelectionIndividualRecord) {
    const originalFamilyId = individual.getFamilyAsChild().pointer()[0];
    if (originalFamilyId) {
      const filter = (family: SelectionAny) => {
        const f = family as SelectionFamilyRecord;
        return ((f.pointer()[0] !== originalFamilyId) && (f.getChild().getIndividualRecord().length > 0));
      }
      
      if (parent.getFamilyAsSpouse().filterSelect(filter).length > 0) {
        return html`
          On the side of <IndividualName gedId={$parent.pointer()} />:<br/>
          ${this.renderUnions(parent,filter, false)}
      `
      }
    }
    return null;
  };
  
  private renderHalfSiblings(individual: SelectionIndividualRecord) {
    const familyAsChild = individual.getFamilyAsChild();
    const father = familyAsChild.getHusband().getIndividualRecord();
    const mother = familyAsChild.getWife().getIndividualRecord();
    const left = this.renderHalfSiblingSide(individual, father),
      right = this.renderHalfSiblingSide(individual, mother);
    if (left || right) {
      return html`
          <h4 class="my-0">Half-siblings</h4>
          <div class="col-span-11 col-end-12 row-span-1">
              ${left}
              ${right}
          </div>
      `;
    }
    return html``;
  }

  private renderTimelineEvent(event: SelectionEvent, i: number, translationKey: string) {
    const value = event.value()[0];
    const date = event.getDate().length > 0 && displayDate(event.getDate());
    const place = event.getPlace().value().map((place) => {
      if (place) {
        return place.split(',').map(s => s.trim()).filter(s => s)
      }
      return [''];
    }).map(parts => parts.join(', '))[0];
    const type = event[0].tag === Tag.Event && event.getType().value()[0];
    let t = html`
      <span class="small-header">
        ${translationKey}
      </span>
    `;
    if(type) {
      t = html`${t} - ${type}`
    }
    if(date) {
      t = html`
        <span class="text-muted">, ${date}</span>
      `
    }
    t = html`
      <div>
        ${t}
      </div>
    `
    if(value && value !== 'Y' ) {
      t = html`
        ${t}
        <div>
          ${value}
        </div>
      `
    }
    if(place) {
      t = html`
      ${t}
      <div>
        <span class="text-muted">
          ${place}
        </span>
      </div>
      `
    }
    return html`
      <li value="${i}">
        ${t}
      </li>
    `
  }

  public renderTimelineCard(individual: SelectionIndividualRecord) {
    const events = individual.get().filter((tn: TreeNode) => {
      if (tn) {
        const tag = tn.tag();
        switch (tag) {
          case
          default
            return false;
        }
        
        const t = e.tag();
        if(t) {
          const k = eventsWithKeys(e);
          return (k !== undefined)
        }
      }
      return false;
    }).as(SelectionIndividualEvent);
    if(events.length === 0 ) {
      return null;
    }
    return html`
      <div class="TimelineCard rounded border-2">
        <div class="CardBody">
          <h4 class="my-0">
            <CalendarWeek class="icon mr-2"/>
            Events
          </h4>
          <div class="flex basis-0 flex-col">
            <ul class="timeline">
              ${events.arraySelect().map((event, i) => {
                if(event[0] && event[0].tag) {
                  let etag = eventsWithKeys(event[0]);
                  etag = etag ? etag : '';
                  return html`${this.renderTimelineEvent(event, i, etag)}`
                }
              })}
            </ul>
          </div>
        </div>
      </div>
        `;
  }

  public renderAncestorsCard (individual: SelectionIndividualRecord) {
    const family = individual.getFamilyAsChild();
    if(family.length > 0) {
      return html`
          <div class="AncestorsCard rounded border-2">
              <div class="CardBody">
                  <h4 class="my-0">
                      <i class="fa-solid fa-code-fork"></i>
                      Ancestors chart
                  </h4>
                  <div class="flex basis-0 flex-col">
                      <div class="block sm:hidden">
                          <ancestorstree-chart gedId=${individual.pointer()} maxDepth="1" />
                      </div>
                      <div class="hidden sm:max-lg:block lg:hidden">
                          <ancestorstree-chart gedId=${individual.pointer()} maxDepth="2" />
                      </div>
                      <div class="hidden lg:block ">
                          <ancestorstree-chart gedId=${individual.pointer()} maxDepth="3" />
                      </div>
                  </div>
              </div>
          </div>
        `

    }
    return null;
  }

  public render() {
    /*const t = html`
        
                <Card.Title>
                    <Person class="icon mr-2"/>
                    <IndividualName individual={individualOpt} gender noLink />
                    <DropdownButton title={<ThreeDotsVertical class="icon" />} variant="outline-secondary" size="sm" style={{ position: 'absolute', right: '0.5rem', top: '0.5rem' }}>
                    <Dropdown.Item href="#" disabled={rootIndividual !== null && individualOpt[0].pointer === rootIndividual[0].pointer} onClick={() => setRootIndividualDispatch(file, individualOpt)}>
                    <HouseDoor class="icon mr-2" />
                    <FormattedMessage id="page.individual.actions.define_root"/>
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <LinkContainer to={{
                                   pathname: AppRoutes.print,
                                   state: { initialIndividualId: individualOpt[0].pointer },
                                   }}>
                        <Dropdown.Item disabled>
                            <Printer class="icon mr-2" />
                            <FormattedMessage id="page.individual.actions.print"/>
                        </Dropdown.Item>
                    </LinkContainer>
                    <Dropdown.Divider />
                    <DebugGedcom triggerComponent={({ onClick }) =>
                        <Dropdown.Item href="#" onClick={onClick}>
                            <Bug class="icon mr-2" />
                            <FormattedMessage id="page.individual.actions.debug"/>
                        </Dropdown.Item>
                        } node={individualOpt[0]} root={file} />
                        </DropdownButton>
                </Card.Title>
                <Card.Subtitle class="text-muted text-monospace">
                    {individualId}
                </Card.Subtitle>
            </Card.Header>
            <Card.Body>
                {renderGeneral(individualOpt)}
                {renderParents(individualOpt)}
                {renderUnions(individualOpt)}
                {renderSiblings(individualOpt)}
                {renderHalfSiblings(individualOpt)}
            </Card.Body>

        {renderAncestorsCard(individualOpt)}

        {renderTimelineCard(individualOpt)}

        {renderStatisticsCard(individualOpt)}
    `*/
    if(this.gedId && this.individual) {
      console.log(`individual render; this.gedId is ${this.gedId}`)
      return html`
          <div class="flex-auto gap-1  ">
              <div class="flex-auto ">
                  <div class="grid grid-cols-12 grid-rows-2 bg-gray-100">
                      <div class="col-span-11 col-end-12 row-span-1 ">
                          <individual-name gedid="${this.gedId}"></individual-name>
                      </div>
                      <div class="col-span-1 row-span-1">
                          <button-menu></button-menu>
                      </div>
                      <div class="col-span-1 row-span-1">
                          ${this.gedId}
                      </div>
                  </div>
                  <div class="flex-auto basis-0 flex-col gap-0 rounded border-2 ">
                      <div class="flex-auto flex-col ">
                          ${this.renderGeneral(this.individual)}
                      </div>
                      <div class="flex-auto flex-col my-0 gap-0">
                          ${this.renderParents(this.individual)}
                      </div>
                      <div class="flex-auto flex-col gap-0">
                          ${this.renderUnions(this.individual)}
                      </div>
                      <div class="flex-auto flex-col">
                          ${this.renderSiblings(this.individual)}
                      </div>
                      <div class="flex-auto flex-col">
                          ${this.renderHalfSiblings(this.individual)}
                      </div>
                  </div>
              </div>
              ${this.renderAncestorsCard(this.individual)}
              ${this.renderTimelineCard(this.individual)}
          </div>
          
      `
    } else {
      return html`No Gramps ID set`
    }

  }
  
}
customElements.define('gedcom-individual', GedcomIndividual)

