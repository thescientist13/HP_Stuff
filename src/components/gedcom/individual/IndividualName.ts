import {LitElement, html, nothing, css, unsafeCSS, } from 'lit';
import {property, state} from 'lit/decorators.js';
import {consume} from '@lit-labs/context';
import { allTasks } from 'nanostores'

import { delay } from 'nanodelay'

import type { SelectionIndividualRecord} from 'read-gedcom';
// @ts-ignore
import { ValueSex } from 'read-gedcom';

import { gedcomDataController, gcDataContext } from '../state/database';
import type {PropertyValues} from "lit";

import {TailwindMixin} from "../../tailwind.element";

import {IndividualEvents} from "./IndividualEvents";

import style from '../../../styles/Individual.css?inline'

declare enum ValueSex {
  Male = 'M',
  Female = 'F',
  Intersex = 'X',
  Unknown = 'U',
  NotRecorded = 'N'
}

export class IndividualName extends TailwindMixin(LitElement,style) {
  
  @state()
  public gcDataController = new gedcomDataController(this);
  
  @property({type: String})
  public gedId;
  
  @state()
  individual: SelectionIndividualRecord | null;
  
  @property()
  placeholder;
  
  @property()
  gender;
  
  @property({type: Boolean})
  link;
  
  @property()
  noAncestry;
  
  @state()
  settings: any;
  
  @state()
  ancestors: any;
  
  @state()
  descendants: any;
  
  @state()
  related: any;
  
  @state()
  rootId: number| string;
  
  constructor() {
    super();
    
    //fontawesome

    this.rootId = 0;
    this.gedId = '';
    this.individual = null;
    this.placeholder = '?';
    this.gender = false;
    this.link = false;
    this.noAncestry = false;
    this.descendants = null;
    this.ancestors = null;
    this.related = null;
    
  }
  

  
  public async willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties)
    if (changedProperties.has('gedId')) {
      console.log(`individualName willUpdate; detected value ${this.gedId}`)
      if (this.gcDataController && this.gcDataController.gedcomStoreController && this.gcDataController.gedcomStoreController.value) {
        this.individual = this.gcDataController.getIndividualRecord(this.gedId)
        this.requestUpdate();
      } else {
        console.log(`individualName willUpdate; I need to set the indiviuual, but cannot because the controller is not set`)
        if (!this.gcDataController) {
          console.log(`individualName willUpdate; problem is the top controller`)
        } else if (!this.gcDataController.gedcomStoreController) {
          console.log(`individualName willUpdate; problem is the inner controller`)
        } else {
          console.log(`individualName willUpdate; problem is the value`)
        }
      }
    }
  }
  
  
  public displayName(individual: SelectionIndividualRecord, placeholder = '') {
    console.log(`individualName displayName; individual: ${individual.toString()}`)
    const name = individual.getName();
    console.log(`individualName displayName; name: ${name.toString()}`);
    const parts = name.valueAsParts();
    return parts.filter((v) => {
      return v !=null;
    }).map((v) => {
      if(v) {
        const r2 = v.filter((s) => {
          if(s){
            return s;
          } else {
            return null;
          }
        })
        return r2.map((s) => {
          if(s) {
            return s.toString().replace(/_+/g, ' ')
          } else {
            return null;
          }
        }).join(' ')
      } else {
        return null;
      }

    })[0];
  }


  
  render() {
    let genderIcon = html``;
    let t = html``;
    if (this.individual) {
      if (this.gcDataController) {
        t = html`${t}<i class="fa-regular fa-user fa-1x"></i>`
        console.log(`individualName render; individual is of type ${typeof this.individual}`)
        console.log(`individualName render; individual: ${this.individual.toString()}`)
        const name = this.displayName(this.individual);
        console.log(`individualName render; name: ${name}`)
        const content = name ? name : this.placeholder;
        console.log(`individualName render; content is ${content}`)
        const id = this.individual.pointer()[0];
        const genderValue = this.individual.getSex().value()[0];
        if (genderValue) {
          this.gender = true;
          if (genderValue === ValueSex.Male) {
            genderIcon = html`<i class="fa-solid fa-mars fa-1x color-male"></i>`;
          } else {
            genderIcon = html`<i class="fa-solid fa-venus fa-1x color-female"></i>`;
          }
        }
        if (this.link) {
          let u = this.gcDataController.getUrl();
          console.log(`individualName render; u is ${u}`)
          if (u) {
            let l: string | string[] = this.individual.getName().getSurname().valueNonNull()
            if (l && l.length > 0) {
              l = l[0].replace(/ /g, '_').toLowerCase();
              console.log(`link l is ${l.toString()}`)
              let f: string | string[] = this.individual.getName().getGivenName().valueNonNull()
              if (f) {
                f = f[0].replace(/ /g, '_').toLowerCase();
                console.log(`individualName render; f is ${f}`)
                const s = '/harrypedia/people/'.concat(l).concat('/').concat(f).concat('/');
                console.log(`individualName render;  s is ${s}`)
                u = new URL(s, u);
                t = html`${t}${genderIcon} <a href="${u}">${content}</a>`
              }
            }
          } else {
            t = html`${t}${genderIcon} ${content}`
          }
        } else {
          t = html`${t}${genderIcon} ${content}`
        }
        t = html`${t}`
        return t;
      }
    }
    return html`pending individual ${this.gedId}`
  }
  
}

customElements.define('individual-name', IndividualName);


/*OriginalIndividualName({individual, placeholder, gender, noLink, noAncestry}) {
  const {data: {settings, ancestors, descendants}} = useSelector(state => state.gedcomFile);
  
  const isAncestor = ancestors && ancestors.has(id);
  const isDescendant = descendants && descendants.has(id);
  const hasAncestorIcon = !noAncestry && (isAncestor || isDescendant);
  const rootIndividualName = hasAncestorIcon && displayName(settings.rootIndividual, '?')
  const genderClass = `icon${hasAncestorIcon ? '' : ' mr-1'}`;
  
  return individual.length === 0 ? content : (
    <>
      {gender && (genderValue === ValueSex.Male ? <GenderMale className = {`${genderClass} color-male`
}
  /> : genderValue === ValueSex.Female ? <GenderFemale className={`${genderClass} color-female`} / >
:
  <Question className = {genderClass}
  />)}
  {
    hasAncestorIcon && (
      <OverlayTrigger
        placement = "top"
    overlay = {
      < Tooltip
    id = "tooltip-ancestry" >
    {isAncestor && isDescendant ?
      <FormattedMessage id = "component.ancestry.root" values = {
    {
      name: rootIndividualName, gender
    :
      genderValue
    }
  }
    />
  :
    isAncestor ?
      <FormattedMessage id = "component.ancestry.ancestor" values = {
    {
      name: rootIndividualName, gender
    :
      genderValue
    }
  }
    />
  :
    <FormattedMessage id = "component.ancestry.descendant"
    values = {
    {
      name: rootIndividualName, gender
    :
      genderValue
    }
  }
    />
  }
    </Tooltip>
  }
  >
    <Record2Fill className = {`icon ${isAncestor && isDescendant ? 'text-info' : isAncestor ? 'text-success' : 'text-primary'}`
  }
    />
    < /OverlayTrigger>
  )
  }
  {
    noLink ? content : (
      <NormalLink to = {AppRoutes.individualFor(individual[0].pointer)} >
        {content}
        < /NormalLink>
    )
  }
  </>
)
  ;
}
*/