import {LitElement, html,} from 'lit';
import { state} from 'lit/decorators.js';

import {TailwindMixin} from "../tailwind.element";

import styles from '@styles/Gramps.css?inline';

import {zodData, fetchData} from './state';

import {withStores} from "@nanostores/lit";

import {
  type Quality,
  type DatevalType,
  type EventType,
  type Role,
  type RelType,
  type Gender,
  type Derivation,
  type NameType,
  type RepositoryType,
  type UrlType,
  type Medium,
  type Xml,
  type Tag,
  type Tags,
  type Sourceref,
  type ReporefElement,
  type Source,
  type Sources,
  type Url,
  type Repository,
  type Repositories,
  type Pname,
  type Coord,
  type Placeobj,
  type Places,
  type Personref,
  type SurnameClass,
  type NameElement,
  type Address,
  type EventrefElement,
  type Person,
  type People,
  type Note,
  type Notes,
  type Researcher,
  type Created,
  type Header,
  type Rel,
  type PurpleChildref,
  type ChildrefElement,
  type Family,
  type Families,
  type EventDateval,
  type Datestr,
  type DaterangeClass,
  type Attribute,
  type Event,
  type Events,
  type CitationDateval,
  type Citation,
  type Citations,
  type Database,
  type Export, SourcerefSchema, DatabaseSchema
} from '@lib/GrampsZodTypes';


export class GenealogicalData extends TailwindMixin(withStores(LitElement, [zodData]), styles) {

  @state()
  private url: URL | string | null;

  constructor() {
    super();

    this.url = new URL('/gramps/gramps.json', document.URL );

  }

  connectedCallback() {
    super.connectedCallback()
    console.log(`initial url is ${this.url}`)
    if(this.url instanceof URL) {
      fetchData(this.url);
      zodData.listen(() => {
        this.requestUpdate();
      })
    }
  }

  render() {
    const gramps = zodData.get();
    if(gramps !== null && gramps !== undefined) {
      console.log(`grampsParser/index render; `)

      let t = html``
      if(gramps) {
        console.log(`grampsParser/index render; confirmed I have parsed data`)
        t = html`${t}Gramps Data exported ${gramps.header.created.date}<br/>`
        const psize = gramps.people.person.length;
        t = html`${t}There are ${psize} people<br/>`;
        const fsize = gramps.families.family.length;
        t = html`${t}There are ${fsize} families<br/>`;
        const esize = gramps.events.event.length;
        t = html`${t}There are ${esize} events<br/>`;
      }
      return html`${t}`
    }
    return html`No Header Info Available`;
  }
}

customElements.define('genealogical-data', GenealogicalData);


