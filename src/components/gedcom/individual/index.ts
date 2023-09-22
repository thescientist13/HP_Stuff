import {LitElement, html, css, nothing} from 'lit';
import type { PropertyValues, TemplateResult } from 'lit'
import {property, state} from 'lit/decorators.js';
import {createRef, ref } from 'lit/directives/ref.js';
import type { Ref } from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import { StoreController,withStores } from '@nanostores/lit'
import {createContext, provide} from '@lit-labs/context';


import { gedcomDataController, gcDataContext } from '../state/database';

import type { SelectionIndividualRecord, SelectionFamilyRecord, SelectionAny } from 'read-gedcom';

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


export class GedcomIndividual extends LitElement {
  
  @property()
  public url: URL | string | null;
  
  @property({type: String})
  public gedId: string;
  
  @provide({context: gcDataContext})
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
    console.log(`individual willUpdate callback, url is ${this.url}`)
    if(this.url && this.gcDataController && (this.url.toString().localeCompare(this.gcDataController.getUrl().toString()))) {
      console.log(`setting gedcomDataController url`)
      this.gcDataController.setUrl(new URL(this.url));
    }
    if((!this.individual) && (this.gedId !== '') && (this.gcDataController && this.gcDataController.gedcomStoreController && this.gcDataController.gedcomStoreController.value)) {
      console.log(`individual willUpdate; detected need to set this.individual`)
      const store = this.gcDataController.gedcomStoreController.value;
      this.individual = store.getIndividualRecord(this.gedId);
      if(typeof(this.individual) === 'string') {
        console.log(`retrieved a string for the individual ${this.individual}`)
      } else {
        console.log(`individual willUpdate; individual was not a string`)
        this.requestUpdate();
      }
    }else {
      if(this.gedId === '') {
        console.log(`individual willUpdate; gedId is blank`);
      }
      if(this.individual) {
        console.log(`individual willUpdate; this.individual is set already`)
      }
      if(!this.gcDataController){
        console.log(`individual willUpdate; I have no gcDataController`)
      } else if (!this.gcDataController.gedcomStoreController) {
        console.log(`individual willUpdate; I have no gedcomStoreController`)
      } else {
        console.log(`individual willUpdate: store has no value`)
      }
    }
  }
  
  private renderParents(individual: SelectionIndividualRecord) {
    const familyAsChild = individual.getFamilyAsChild(); // TODO filter adoptive
    return html`
                <h6>Parents</h6>
                <ul>
                    <li><IndividualRich individual={familyAsChild.getHusband().getIndividualRecord()} /></li>
                    <li><IndividualRich individual={familyAsChild.getWife().getIndividualRecord()} /></li>
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
        <IndividualRich individual={other} simpleDate noPlace simpleRange/>
    `;
    if (marriage.length > 0) {
      spouseData = html`
          ${spouseData},
          <EventName event=${marriage} name="married"/>
      `
    }
    if (hadChildren) {
      return html`
          With ${spouseData}:
          <ul>
              ${children.arraySelect().map((child: SelectionIndividualRecord, i: number) => {
                  return html`
                      <li key={i}>
                          <IndividualRich individual={child} gender simpleDate noPlace simpleRange/>
                      </li>`
              })}
          </ul>
      `
    } else {
      return spouseData;
    }
  }
  private renderUnions(individual: SelectionIndividualRecord, familiesFilter: (s: SelectionAny) => boolean, title = true) {
    const familiesAsSpouse = individual.getFamilyAsSpouse().filterSelect(familiesFilter);
    const orderIfSpecified = individual.getSpouseFamilyLink().value();
    let ordered: any[] = [];
    if (familiesAsSpouse.length === 0) {
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
                  <li key=${i}>${this.renderUnion(individual, family)}</li>
              `
          })}
          </ul>
      `
    }
  }
  
  private renderGeneral(individual: SelectionIndividualRecord) {
    const birth = individual.getEventBirth(), death = individual.getEventDeath();
    const occupationValue = individual.getAttributeOccupation().value().filter(s => s).join(', ');
    const gender = individual.getSex().value()[0];
    const events = [
      { event: birth, name: "Born", silent: true },
      { event: death, name: "Deceased", silent: true }
    ].filter(({ event, silent }) => event.length > 0 && (!silent || !isEventEmpty(event)));
    return  html`
      <ul>
          ${events.map(({event, name, silent}, i) => {
              return html`<li key=${i}><EventName event=${event} name=${name}  /></li>`;
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
                return html`<li key=${i}><IndividualRich individual=${child} gender simpleDate noPlace simpleRange /></li>)`;
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
      return html`<individual-name gedid=${this.gedId} ></individual-name>`
    } else {
      return html`No Gramps ID set`
    }

  }
  
}
  customElements.define('gedcom-individual', GedcomIndividual)


