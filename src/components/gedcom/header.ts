import {LitElement, html, css, nothing} from 'lit';
import type { PropertyValues, TemplateResult } from 'lit'
import {property, state} from 'lit/decorators.js';
import {createRef, ref } from 'lit/directives/ref.js';
import type { Ref } from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import { StoreController,withStores } from '@nanostores/lit'
import { gedcomDataController } from './state/database';
import type { SelectionGedcom,  } from 'read-gedcom';
import {toJsDate, parseNameParts, SelectionIndividualRecord} from "read-gedcom";
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


import {displayDateExact, displayName} from './util';

export class GedcomHeader extends LitElement {
  
  @property()
  public url: URL | string | null;
  
  private gcDataController = new gedcomDataController(this);
  
  constructor() {
    super();
    
    this.url = null;
    
  }
  
  public async willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties)
    console.log(`in willUpdate callback, url is ${this.url}`)
    if(this.url && (this.url.toString().localeCompare(this.gcDataController.getUrl().toString()))) {
      console.log(`setting gedcomDataController url`)
      this.gcDataController.setUrl(new URL(this.url));
    }
  }
  
  
  private renderRootIndividual() {
    this.gcDataController.initializeAllFields()
    const  rootSelection = this.gcDataController.gedcomStoreController.value;
    if(rootSelection) {
      const allFields = this.gcDataController.initializeAllFields();
      if(allFields){
        const rootIndividual = allFields.settings.rootIndividual;
        if(rootIndividual) {
          return html`
              <table>
                  <tbody>
                  <tr>
                      <td>
                          ${rootIndividual.toString()}
                      </td>
                  </tr>
                  </tbody>
              </table>
              
          `
        }
      }
    }
    return null;
  }
  
  private renderStats() {
    if(this.gcDataController) {
      const rootIndividual = this.gcDataController.gedcomStoreController.value;
      if(rootIndividual) {
        const allFields = this.gcDataController.initializeAllFields();
        if(allFields){
          const dependant = allFields.dependant;
          const statistics = dependant.statistics;
          let ta: TemplateResult<1> | boolean = false;
          if (statistics.totalAncestors !== null) {
            ta = html`
              <tr>
                  <td>Ancestors:</td>
                  <td>${statistics.totalAncestors}</td>
              </tr>
          `
          }
          let td: TemplateResult<1> | boolean = false;
          if (statistics.totalDescendants !== null) {
            td = html`
              <tr>
                  <td>Descendants:</td>
                  <td>${statistics.totalDescendants}</td>
              </tr>
          `
          }
          let tr: TemplateResult<1> | boolean = false;
          if (statistics.totalRelated !== null) {
            tr = html`
              <tr>
                  <td>Related:</td>
                  <td>${statistics.totalRelated}</td>
              </tr>
          `
          }
          return html`
           <table class="ht-2">
               <tbody class="ht-2">
               <tr>
                   <td>Individuals:</td>
                   <td>${statistics.totalIndividuals}</td>
               </tr>
               ${ta ?? nothing}
               ${ td ?? nothing}
               ${ tr ?? nothing}
               </tbody>
           </table>
         `
        }
      }
    }
    return null;
  }
  
  private renderProvider(selection: SelectionGedcom) {
    const source = selection.getHeader().getSourceSystem();
    const provider = source.value()[0];
    const webAltTag = '_ADDR';
    const url = source.getCorporation().getWebAddress().value()[0] || source.getCorporation().get(webAltTag).value()[0];
    if(provider && url) {
      return html`
          <a href=${url} target="_blank" rel="noreferrer">
              ${provider}
          </a>
        `
    } else {
      return provider;
    }
  }
  
  private renderFileInfo() {
    if (this.gcDataController) {
      const rootSelection = this.gcDataController.gedcomStoreController.value;
      if (rootSelection) {
        return html`
            <table>
                <tbody>
                <tr>
                    <td>Name:</td>
                    <td>${this.url}</td>
                </tr>
                <tr>
                    <td></td>
                    <td>${this.renderProvider(rootSelection)}</td>
                </tr>
                <tr>
                    <td>Version:</td>
                    <td>${rootSelection.getHeader().getSourceSystem().getVersion().value()[0]}</td>
                </tr>
                <tr>
                    <td>Date</td>
                    <td>${rootSelection.getHeader().getFileCreationDate().length ? displayDateExact(rootSelection.getHeader().getFileCreationDate(), true) : nothing}</td>
                </tr>
                </tbody>
            </table>
        `
      }
    }
    return null;
  }
  
  private renderSubmitter () {
    if (this.gcDataController) {
      const rootSelection = this.gcDataController.gedcomStoreController.value;
      if (rootSelection) {
        const submitter = rootSelection.getSubmitterRecord();
        const name = displayName(submitter.as(SelectionIndividualRecord), '?'); // Same API, but beware of changes
        const email = submitter.get(['EMAIL', '_MAIL']).value()[0];
        let e;
        if(email) {
          e =  html`
            <a href="mailto:${email}" target="_blank" rel="noreferrer">
                ${name}
                <ui5-icon name="email"></ui5-icon>
            </a>
          `
        } else {
          e = html`${name}`;
        }
        return html`
              <table borderless>
                  <tbody>
                  <tr>
                      <td>Name:</td>
                      <td>
                          ${e}
                      </td>
                  </tr>
                  </tbody>
              </table>
            `
      }
    }
  }
  
  static styles = css`
    .ht-1 {
      vertical-align: top;
      width: 100%;
    }
    
    
    .ht-2{
      height: 100%;
    }
  `
  
  
  render() {
    
    
    return html`
        <ui5-card >
            <table class="ht-1">
                <tbody class="ht-1">
                <tr>
                    <td >
                        <ui5-title level="H3" style="padding-block-end: 1rem;">
                            <ui5-icon name="home"></ui5-icon> Root Individual
                        </ui5-title>
                        ${this.renderRootIndividual()}
                    </td>
                    <td >
                        <ui5-title level="H3" style="padding-block-end: 1rem;">
                            <ui5-icon name="vertical-bar-chart-2"></ui5-icon> % Statistics
                        </ui5-title>
                        ${this.renderStats()}
                    </td>
                </tr>
                <tr>
                    <td>
                        <ui5-title level="H3" style="padding-block-end: 1rem;">
                            <ui5-icon name="document-text"></ui5-icon> File metadata
                        </ui5-title>
                        ${this.renderFileInfo()}
                    </td>
                    <td>
                        <ui5-title level="H3" style="padding-block-end: 1rem;">
                            <ui5-icon name="person-placeholder"></ui5-icon> Author Details
                        </ui5-title>
                        ${this.renderSubmitter()}
                    </td>
                </tr>
                <tr>
                    <td>
                        <ui5-title level="H3" style="padding-block-end: 1rem;">
                            Tools
                        </ui5-title>
                        ${this.gcDataController.render()}
                    </td>
                </tr>
                </tbody>
            </table>
        </ui5-card>
    `
  }
  
  
}

customElements.define('gedcom-header', GedcomHeader)