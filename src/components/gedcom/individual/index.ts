import {LitElement, html, css, nothing} from 'lit';
import type { PropertyValues, TemplateResult } from 'lit'
import {property, state} from 'lit/decorators.js';
import {createRef, ref } from 'lit/directives/ref.js';
import type { Ref } from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import { StoreController,withStores } from '@nanostores/lit'
import {createContext, provide} from '@lit-labs/context';

import {TailwindMixin} from "../../tailwind.element";

import { gedcomDataController, gcDataContext } from '../state/database';

import type {SelectionIndividualRecord, SelectionFamilyRecord, SelectionAny, SelectionEvent} from 'read-gedcom';

import {ButtonMenu} from '../../ButtonMenu';
import {EventName} from '../EventName';

import { z } from "zod";


import {
  computeAncestors,
  computeDescendants,
  computeInbreedingCoefficient, computeRelated, computeRelatednessCoefficient,
  displayDate,
  displayName,
  isEventEmpty, setIntersectionSize,
} from '../util';

import { IndividualName } from './IndividualName'
//import { IndividualRich} from "./IndividualRich";

import style from '../../../styles/Individual.css?inline';
import {IndividualRich} from "./IndividualRich";

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
                <h6>Parents</h6>
                <ul>
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
      spouseData = html`
          ${spouseData},
          ${EventName({event: marriage,noPlace: true, name: "married"})}
      `
    }
    if (hadChildren) {
      return html`
          With ${spouseData}:
          <ul>
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
          <h6>Unions & children</h6>
          ${ordered.map((family, i) => {
              return html`
                  <li >${this.renderUnion(individual, family)}</li>
              `
          })}
          </ul>
      `
    }
  }
  
  private renderGeneral(individual: SelectionIndividualRecord) {
    const birth = individual.getEventBirth(), death = individual.getEventDeath();
    const occupationValue = individual.getAttributeOccupation().value().filter(s => s).join(', ');
    //gender is used for i18n formatted strings
    const gender = individual.getSex().value()[0];
    const events = [
      { event: birth, name: "Born", silent: true },
      { event: death, name: "Deceased", silent: true }
    ].filter(({ event, silent }) => event.length > 0 && (!silent || !isEventEmpty(event)));
    return  html`
      <ul>
          ${events.map(({event, name, silent}, i) => {
              return html`<li >${EventName({event: event as SelectionEvent, name: name, nameAlt: (silent ? '' : false)})}</li>`;
          })}
          ${occupationValue ? html`<li>${occupationValue}</li>` : nothing}
      </ul>
      
    `;
  };
  
  private renderSiblings (individual: SelectionIndividualRecord){
    const siblings = individual.getFamilyAsChild().getChild().getIndividualRecord().filter(s => s.pointer !== individual[0].pointer);
    if (siblings.length === 0) {
      return null;
    } else {
      return html`
          <h6>Siblings</h6>
          <ul>
              ${siblings.filter(child => child.pointer !== individual[0].pointer).arraySelect().map((child, i) => {
                return html`<li >${IndividualRich({individual: child, noPlace: true})}</li>`;
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
          On the side of <IndividualName individual={$parent} />:<br/>
          ${this.renderUnions(parent,filter, false)}
      `
      }
    }
    return nothing
  };
  

  
  public render() {
    /*const t = html`
        
                <Card.Title>
                    <Person className="icon mr-2"/>
                    <IndividualName individual={individualOpt} gender noLink />
                    <DropdownButton title={<ThreeDotsVertical className="icon" />} variant="outline-secondary" size="sm" style={{ position: 'absolute', right: '0.5rem', top: '0.5rem' }}>
                    <Dropdown.Item href="#" disabled={rootIndividual !== null && individualOpt[0].pointer === rootIndividual[0].pointer} onClick={() => setRootIndividualDispatch(file, individualOpt)}>
                    <HouseDoor className="icon mr-2" />
                    <FormattedMessage id="page.individual.actions.define_root"/>
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <LinkContainer to={{
                                   pathname: AppRoutes.print,
                                   state: { initialIndividualId: individualOpt[0].pointer },
                                   }}>
                        <Dropdown.Item disabled>
                            <Printer className="icon mr-2" />
                            <FormattedMessage id="page.individual.actions.print"/>
                        </Dropdown.Item>
                    </LinkContainer>
                    <Dropdown.Divider />
                    <DebugGedcom triggerComponent={({ onClick }) =>
                        <Dropdown.Item href="#" onClick={onClick}>
                            <Bug className="icon mr-2" />
                            <FormattedMessage id="page.individual.actions.debug"/>
                        </Dropdown.Item>
                        } node={individualOpt[0]} root={file} />
                        </DropdownButton>
                </Card.Title>
                <Card.Subtitle className="text-muted text-monospace">
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
        <!-- component -->
          <div class="grid grid-flow-row grid-cols-12 grid-rows-10">
            <div class="col-span-12 row-span-2 grid grid-cols-12 grid-rows-2">
              <div class="col-span-11 col-end-12 row-span-1">
                <individual-name gedid="${this.gedId}" ></individual-name>
              </div>
              <div class="col-span-1 row-span-1">
                <button-menu></button-menu>
              </div>
              <div class="col-span-1 row-span-1">
                ${this.gedId}
              </div>
            </div>
            <div class="col-span-12 row-span-8 ">
              ${this.renderGeneral(this.individual)}
              ${this.renderParents(this.individual)}
              ${this.renderUnions(this.individual)}
              ${this.renderSiblings(this.individual)}
              
            </div>
          </div>  

              
      `
    } else {
      return html`No Gramps ID set`
    }

  }
  
}
customElements.define('gedcom-individual', GedcomIndividual)


