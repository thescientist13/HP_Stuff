import {LitElement, html, nothing, css, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import {consume} from '@lit-labs/context';
import { allTasks } from 'nanostores'

import type { SelectionIndividualRecord} from 'read-gedcom';
// @ts-ignore
import { ValueSex } from 'read-gedcom';

import { type gedcomDataController, gcDataContext } from '../state/database';
import type {PropertyValues} from "lit";

import { library, dom as fontAwesomeDom } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'


declare enum ValueSex {
  Male = 'M',
  Female = 'F',
  Intersex = 'X',
  Unknown = 'U',
  NotRecorded = 'N'
}

export class IndividualName extends LitElement {
  
  @consume({context: gcDataContext})
  @property({attribute: false})
  public gcDataController?: gedcomDataController;
  
  @property({type: String})
  public gedId;
  
  @state()
  individual: SelectionIndividualRecord | null;
  
  @property()
  placeholder;
  
  @property()
  gender;
  
  @property()
  noLink;
  
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
  
  constructor() {
    super();
    
    //fontawesome
    library.add(fas, far, fab)
    
    this.gedId = '';
    this.individual = null;
    this.placeholder = '?';
    this.gender = false;
    this.noLink = false;
    this.noAncestry = false;
    this.descendants = null;
    this.ancestors = null;
    this.related = null;
    
  }
  
  connectedCallback() {
    super.connectedCallback()
    
    // @ts-ignore
    fontAwesomeDom.watch({
      autoReplaceSvgRoot: this.renderRoot,
      observeMutationsRoot: this.renderRoot,
    });
    
  }
  
  public async willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties)
    if((changedProperties.has('gedId')) || ((this.gedId) && (this.gedId !== undefined))) {
      console.log(`individualName willUpdate; changedProperties has gedId `);
      const newId = changedProperties.get('gedId');
      console.log(`individualName willUpdate; found newID ${newId}`)
      if(newId !== undefined && this.gedId.localeCompare(newId)) {
        console.log(`I have new id ${newId}`)
        if(this.gcDataController && this.gcDataController.gedcomStoreController && this.gcDataController.gedcomStoreController.value) {
          console.log(`individualName willUpdate; setting individual`)
          this.individual = this.gcDataController.getIndividualRecord(newId)
        } else {
          console.log(`individualName willUpdate; I need to set the indiviuual, but cannot because the controller is not set`)
          if(!this.gcDataController) {
            console.log(`individualName willUpdate; problem is the top controller`)
          } else if(!this.gcDataController.gedcomStoreController) {
            console.log(`individualName willUpdate; problem is the inner controller`)
          } else {
            console.log(`individualName willUpdate; problem is the value`)
          }
        }
      } else if(this.gedId) {
        if(this.gcDataController && this.gcDataController.gedcomStoreController && this.gcDataController.gedcomStoreController.value) {
          console.log(`in willUpdate for individualName, setting individual based on prior id`)
          this.individual = this.gcDataController.getIndividualRecord(this.gedId)
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

  static styles=css`
    ${unsafeCSS(fontAwesomeDom.css())}
    .color-male {
      color: #006657;
    }

    .color-female {
      color: #380097;
    }

  `
  
  render() {
    let genderIcon = html``;
    if (this.individual) {
      console.log(`individualName render; individual is of type ${typeof this.individual}`)
      console.log(`individualName render; individual: ${this.individual.toString()}`)
      const name = this.displayName(this.individual);
      console.log(`individualName render; name: ${name}`)
      const content = name ? name : this.placeholder;
      const id = this.individual.pointer()[0];
      const genderValue = this.individual.getSex().value()[0];
      if(genderValue){
        this.gender = true;
        if(genderValue === ValueSex.Male) {
          genderIcon = html`<i class="fa-solid fa-mars fa-1x color-male"></i>`;
        } else {
          genderIcon = html`<i class="fa-solid fa-venus fa-1x color-female"></i>`;
        }
      }
      return html`
        ${genderIcon} ${content}<br/>${this.gedId}
    `
    }
    return html`pending individual`
  }
  
};

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