import {LitElement, html, css} from 'lit';
import {property, state} from 'lit/decorators.js';
import {consume} from '@lit-labs/context';
import { allTasks } from 'nanostores'

import { SelectionIndividualRecord, type ValueSex } from 'read-gedcom';
import { GenderFemale, GenderMale } from '../icons';

import { type gedcomDataController, gcDataContext } from '../state/database';
import {PropertyValues} from "lit/development";

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
  settings;
  
  @state()
  ancestors;
  
  @state()
  descendants;
  
  @state()
  related;
  
  constructor() {
    super();
    
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
  
  public async willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties)
    if(changedProperties.has('gedId')) {
      const newId = changedProperties['gedId'];
      if(this.gedId.localeCompare(newId)) {
        console.log(`I have new id ${newId}`)
        if(this.gcDataController && this.gcDataController.gedcomStoreController && this.gcDataController.gedcomStoreController.value) {
          this.individual = this.gcDataController.gedcomStoreController.value.getIndividualRecord(newId);
          this.requestUpdate();
        }
      }
    }
    
  }
  
  public displayName(individual: SelectionIndividualRecord, placeholder = '') {
    const name = individual.getName().valueAsParts();
    
    /*  .getName()
      .valueAsParts()
      .filter(v => v != null)
      
      .map(v =>{
        if(v){
            v.filter(s => s).map(s => {
                if(s !== undefined) {
                    s.replace(/_+/g, ' ')
                }
            })
        }
      }).join(' ')[0]; */
    
    return name ? name : placeholder;
  }
  
  
  render() {
    
    if (this.individual && (typeof this.individual !== 'string')) {
      console.log(`individual is of type ${typeof this.individual}`)
      const name = this.displayName(this.individual);
      const content = name ? name : this.placeholder;
      const id = this.individual.pointer()[0];
      const genderValue = this.individual.getSex().value()[0];
      return html`id`
    } else if (typeof this.individual === 'string') {
      return html`${this.individual}`
    } else {
      return html`pending individual`
    }
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