import {LitElement, html, css, nothing} from 'lit';
import type { PropertyValues, TemplateResult } from 'lit'
import {property, state} from 'lit/decorators.js';
import {createRef, ref } from 'lit/directives/ref.js';
import type { Ref } from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import { StoreController,withStores } from '@nanostores/lit'
import {createContext, provide} from '@lit-labs/context';


import { gedcomDataController, gcDataContext } from '../state/database';

import type { SelectionIndividualRecord } from 'read-gedcom';

import { z } from "zod";

import "@ui5/webcomponents-icons/dist/home.js";
import "@ui5/webcomponents-icons/dist/vertical-bar-chart-2.js";
import "@ui5/webcomponents-icons/dist/document-text.js";
import "@ui5/webcomponents-icons/dist/person-placeholder.js";
import "@ui5/webcomponents/dist/Card";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents/dist/Label";
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableColumn.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableCell.js";
import "@ui5/webcomponents/dist/Title";
import "@ui5/webcomponents-icons/dist/email.js";

import {displayDateExact, displayName} from '../util';

import { IndividualName } from './IndividualName'
//import { IndividualRich} from "./IndividualRich";


export class GedcomIndividual extends LitElement {
  
  @property()
  public url: URL | string | null;
  
  @property({type: String})
  public gedId: string;
  
  @provide({context: gcDataContext})
  @state()
  gcDataController = new gedcomDataController(this);
  
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
    console.log(`in willUpdate callback, url is ${this.url}`)
    if(this.url && this.gcDataController && (this.url.toString().localeCompare(this.gcDataController.getUrl().toString()))) {
      console.log(`setting gedcomDataController url`)
      this.gcDataController.setUrl(new URL(this.url));
    }
    if((!this.individual) && (this.gedId !== '') && (this.gcDataController && this.gcDataController.gedcomStoreController && this.gcDataController.gedcomStoreController.value)) {
      console.log(`detected need to set this.individual from willUpdate`)
      const store = this.gcDataController.gedcomStoreController.value;
      this.individual = store.getIndividualRecord(this.gedId);
      if(typeof(this.individual) === 'string') {
        console.log(`retrieved a string for the individual ${this.individual}`)
      } else {
        console.log(`individual was not a string`)
      }
    }else {
      if(this.gedId === '') {
        console.log(`gedId is blank`);
      }
      if(this.individual) {
        console.log(`this.individual is set already`)
      }
      if(!this.gcDataController){
        console.log(`I have no gcDataController`)
      } else if (!this.gcDataController.gedcomStoreController) {
        console.log(`I have no gedcomStoreController`)
      } else {
        console.log(`store has no value`)
      }
    }
  }
  
  
  public render() {
    /*const t = html`
        <ui5-card>
            <ui5-card-header slot="header" interactive={true} >
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
        </ui5-card>

        {renderAncestorsCard(individualOpt)}

        {renderTimelineCard(individualOpt)}

        {renderStatisticsCard(individualOpt)}
    `*/
    return html`<individual-name gedid=${this.gedId} ></individual-name>`
  }
  
}
  customElements.define('gedcom-individual', GedcomIndividual)


