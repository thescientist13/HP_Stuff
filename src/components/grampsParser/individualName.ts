import {LitElement, html, nothing} from 'lit';
import type {PropertyValues, TemplateResult} from 'lit'
import {property, state} from 'lit/decorators.js';

import {TailwindMixin} from "../tailwind.element";

import {zodData} from './state';


import {type Database,
    type NameElement,
  type Person,
  SurnameClassSchema,
} from '@lib/GrampsZodTypes';

import style from '../../styles/Gramps.css?inline';

export class IndividualName extends TailwindMixin(LitElement, style) {

  @property()
  public url: URL | string | null;

  @property({type: String})
  public grampsId: string;

  @property({type: Boolean})
  public link: boolean;

  @state()
  private individual: Person |  null;

  constructor() {
    super();

    this.link = false;
    this.url = null;
    this.individual = null;
    this.grampsId = '';

  }

  public async willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties)

  }

  private buildLinkTarget(individual: Person) {
    const names: NameElement[] | NameElement = individual.name;
    let t: string = ''
    if(Array.isArray(names)) {
      let m = names.filter((n) => {
        if (!n.type.localeCompare("Birth Name")) {
          return true;
        }
        return false;
      })
      if(!m) {
        m = [];
        do {
          let n = names.shift();
          if(n && n.first) {
            m.push(n);
          }
          if(n && (((typeof n.surname === 'string') && n.surname.length > 0)) || ((typeof n?.surname === 'object') && (n.surname['#text']).length > 0 )) {
            m.push(n)
          }
        }while(names.length > 0);
      }
      if(!m) {
        t = `${t}`;
      } else {
        t = `${t}/${(typeof m[0].surname === 'string') ? m[0].surname : m[0].surname['#text']}/${m[0].first}`
        if(m && m[0] && m[0].suffix && m[0].suffix.length > 0) {
          t = `${t}_${m[0].suffix}/`
        }
      }
    } else {
      if(names.surname) {
        if(typeof(names.surname) === 'string') {
          t = `${t}${names.surname}`
        } else {
          const r: string = names.surname['#text']
          t = `${t}/${r}`
        }
      }
      if(names.first) {
        t = `${t}/${names.first}`
      }
      if(names.suffix) {
        t = `${t}_${names.suffix}`
      }
    }
    const currentUrl = import.meta.url;
    return new URL(`/harrypedia/people/${t.toLowerCase().replaceAll(/\s/g, '_')}/`, (currentUrl ? currentUrl : ''));
  }


  private displayName(individual: Person) {
    const names: NameElement[] | NameElement = individual.name;
    let t = html``
    if(Array.isArray(names)) {
      console.log(`displayName; names is an Array ${JSON.stringify(names)}`)
      let m = names.filter((n) => {
        if (!n.type.localeCompare("Birth Name")) {
          return true;
        }
        return false;
      })
      if(!m) {
        console.log(`displayName; filter for birth name failed`)
        m = [];
        do {
          let n = names.shift();
          let sTest
          if(n) {
            if(n.first) {
              m.push(n);
            }
            let sTest = SurnameClassSchema.safeParse(n.surname);
            if(sTest.success){
              m.push(n)
            }
          }
        }while(names.length > 0);
      }
      if(!m) {
        console.log(`displayName; second attempt at populating m failed`);
        t = html`${t}`;
      } else {
        console.log(`displayName; I have an m in my else from the second attempt`)
        const n = m.shift();
        if(n) {
          t = html`${t} ${n.first ? n.first : nothing} ${(typeof n.surname === 'string') ? n.surname : n.surname['#text']}`
          if(n && n.suffix && n.suffix.length > 0) {
            t = html`${t} ${n.suffix}`
          }
        }
      }
    } else {
      if(names.title) {
        t = html`${t}${names.title}`
      }
      if(names.first) {
        t = html`${t} ${names.first}`
      }
      if(names.surname) {
        if(typeof(names.surname) === 'string') {
          t = html`${t} ${names.surname}`
        } else {
          const r: string = names.surname['#text']
          t = html`${t} ${r}`
        }
      }
      if(names.suffix) {
        t = html`${t} ${names.suffix}`
      }
    }

    return html`${t}`;
  }


  public render() {
    let t = html``
    if (zodData) {
      console.log(`render; validated controller`)
      const gramps = zodData.get();
      if (this.grampsId && gramps) {
        console.log(`render; and I have an id`)
        const filterResult = gramps.people.person.filter((v) => {
          return v.id === this.grampsId
        })
        if (filterResult && filterResult.length > 0) {
          console.log(`render; filter returned people`)
          const first = filterResult.shift();
          if (first) {
            console.log(`render; and the first was valid`);
            this.individual = first;
            t = html`${t}
            <iconify-icon inline icon="uil:user" ></iconify-icon>
            `
            const gender = this.individual.gender;
            if(gender) {
              if(gender === 'F') {
                t = html`${t}<iconify-icon inline icon="ion:female" class="color-female"></iconify-icon>`;
              } else if(gender === 'M') {
                t = html`${t}<iconify-icon inline icon="ion:male" class="color-male"></iconify-icon>`;
              }
            }
            const _name = this.displayName(this.individual);
            if(this.link) {
              const _link = this.buildLinkTarget(this.individual);
              t = html`${t} <a href="${_link}">${_name}</a>`
            } else {
              t = html`${t} ${_name}`
            }
          }
        }
      }
    }

    return html`${t}`;
  }

}

customElements.define('individual-name', IndividualName);
