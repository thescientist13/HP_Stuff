import {LitElement, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {html, literal} from 'lit/static-html.js';

import {HPGC} from ".";

import * as rgc from 'read-gedcom';

@customElement('hp-family')
export class HPFamily extends LitElement {

  @property({type: String, reflect: true})
  public SurName: string;

  @property({reflect: true})
  public Members: rgc.SelectionIndividualRecord[];


  public constructor() {
    super();

    this.SurName = '';
    this.Members = [];

  };

  public connectedCallback() {
    super.connectedCallback();
    console.log('connector call back');
    window.addEventListener('GedLoaded', (e: Event) => this.Members = this.findMembers((e.target as Element)));
  };

  public disconnectedCallback() {
    window.removeEventListener('GedLoaded', (e: Event) => this.Members = this.findMembers((e.target as Element)));
    console.log('disconnected callback');
    super.disconnectedCallback();
  };

  protected findMembers(target: Element) {
    const g = (target as HPGC).myGedData;
    var m: rgc.SelectionIndividualRecord[] = [];
    if ((typeof(this.SurName) !== 'undefined') && (this.SurName !== '')) {
      console.log('Sur is ' + this.SurName);
      g.getIndividualRecord().arraySelect().forEach(i => {
        const s = (i.getName() as rgc.SelectionNamePieces).getSurname().value();
        if(s !== null) {
          if(Array.isArray(s)) {
            s.forEach(v => {
              if((v !== null) && (v.normalize() === this.SurName.normalize())) {
                m.push(i);
              } else {
              }
            });
          } else if(typeof(s) === 'string') {
            if((s as string).normalize() === this.SurName.normalize()) {
              m.push(i);
            } else {
            }
          } else {
            console.log('entry neither a string nor array');
          }
        }
      });
      console.log('Members at ' + m.length);
    }
    console.log('about to return, m is at ' + m.length);
    return m;
  };

  protected render() {
    
    const lis = [];
    for (const i of this.Members) {
      const n = i.getName();
      var f = '';
      var l = '';
      var s = '';

      if(n !== null) {
        console.log('values are: ' + n.valueAsParts());
        console.log('type is ' + n.getType());
        var t: rgc.SelectionAny = n.getType();
        if((typeof(t) !== 'undefined') && (t !== null) && (t.length > 0)) {
          if(!t.value().includes('married')) {
            f = n.getGivenName().value();
            l = n.getSurname().value();
            s = n.getNameSuffix().value();
            lis.push(html`<li>${f} ${l} ${s}</li>`);
          } 
        }
      } else {
        console.log('why is n null?');
      }
    }

    return html`
      <h4 class="h3">${this.SurName}</h4>
      We have ${this.Members.length} members of the ${this.SurName} family.
      <ul>
        ${lis}
      </ul>
    `;
  };

}

// vim: shiftwidth=2:tabstop=2:expandtab

