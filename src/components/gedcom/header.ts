import { LitElement, html, css} from 'lit';
import {property, state} from 'lit/decorators.js';
import {createRef, ref } from 'lit/directives/ref.js';
import type { Ref } from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import { StoreController } from '@nanostores/lit'
import { $database } from './state/database';
import type { SelectionGedcom } from 'read-gedcom';
import type * as rgc from "read-gedcom";
import {toJsDate, parseNameParts} from "read-gedcom";
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

export class GedcomHeader extends LitElement {
  
  @property({type: String})
  file: string | null;
  
  
  
  constructor() {
    super();
    
    this.file = null;
    
  }
  
  static styles = css`
    .header-table {
   
      width: 100%;
    }
    .header-body {
      width: 100%;
    }
  `
  
  render() {
    
    return html`
        <ui5-card >
            <table class="header-table">
                <tbody class="header=body">
                <tr>
                    <td>
                        <ui5-title level="H3" style="padding-block-end: 1rem;"><ui5-icon name="home"></ui5-icon> Root Individual</ui5-title>
                        test 1
                    </td>
                    <td>
                        <ui5-title level="H3" style="padding-block-end: 1rem;">
                            <ui5-icon name="vertical-bar-chart-2"></ui5-icon> % Statistics
                        </ui5-title>
                        test 2
                    </td>
                </tr>
                <tr>
                    <td>
                        <ui5-title level="H3" style="padding-block-end: 1rem;">
                            <ui5-icon name="document-text"></ui5-icon> File metadata
                        </ui5-title>
                        test 3
                    </td>
                    <td>
                        <ui5-title level="H3" style="padding-block-end: 1rem;">
                            <ui5-icon name="person-placeholder"></ui5-icon> Author Details
                        </ui5-title>
                        test 4
                    </td>
                </tr>
                <tr>
                    <td>
                        <ui5-title level="H3" style="padding-block-end: 1rem;">
                            Tools
                        </ui5-title>
                        file is ${this.file}
                    </td>
                </tr>
                </tbody>
            </table>
        </ui5-card>
    `
  }
  
  
}

customElements.define('gedcom-header', GedcomHeader)