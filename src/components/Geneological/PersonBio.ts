import { LitElement, html } from 'lit';
import {property, state} from 'lit/decorators.js';
import {createRef, ref } from 'lit/directives/ref.js';
import type { Ref } from 'lit/directives/ref';
import {when} from 'lit/directives/when.js';
import { StoreController } from "@nanostores/lit";
import type { GedcomDb } from './database';
import type { SelectionGedcom } from 'read-gedcom';
import type * as rgc from "read-gedcom";
import {toJsDate, parseNameParts} from "read-gedcom";

type Props = Record<string, never>

export class PersonBio extends LitElement {

    @property({type: String, reflect: true})
    public gedid: string;

    @property({type: String, reflect: true})
    public url: string | null;

    @state()
    protected GedData: Ref<HTMLInputElement> = createRef();

    private gcDB: rgc.SelectionGedcom | null;

    @state()
    private gedDataAvailable: boolean;

    @state()
    private gedcomIndividual: rgc.SelectionIndividualRecord | null;

    @state()
    private birthday: string | (Date | null)[] | null;

    @state()
    private deathday: string | (Date | null)[] | null;

    @state()
    private names: rgc.SelectionName | null ;

    public constructor(prop?: Props) {
        super();

        this.gedid = "I0";

        this.gedcomIndividual = null;
        this.names = null;
        this.birthday = null;
        this.deathday = null;

        this.gcDB = null;

        this.gedDataAvailable = false;

        if(prop) {
            console.log(`in PersonBio constructor properties were defined`)
            this.url = prop.url;
        } else {
            this.url = null;
            console.log(`in PersonBio constructor prop was undefined`)
        }

    }

    public connectedCallback() {
        super.connectedCallback();
        if(this.url) {
            console.log(`in connected callback, this.url is of type ${typeof(this.url)}`);
            console.log(`in connected callback, this.url is ${this.url}`)
        }
        this.addEventListener('GedLoaded', (e: Event) => this.gedDefined((e.target as Element)));
    }

    public disconnectedCallback() {
        this.removeEventListener('GedLoaded', (e: Event) => this.gedDefined((e.target as Element)));
        console.log('disconnected callback');
        super.disconnectedCallback();
    };

    private gedDefined(e: Element) {
        console.log('gedDefined is called');
        console.log(`e is a ${e.localName}`);
        console.log(`GedData is a ${this.GedData.value?.localName}`);
        if(this.GedData && this.GedData.value) {
            let g = (this.GedData.value as unknown as GedcomDb).GedData;
            if(g){
                this.gcDB = g;
                console.log(`in PersonBio gedDefined looking for "${this.gedid}"`);
                let i = g.getIndividualRecord(`${this.gedid}`);
                if (!i || (i.length === 0)) {
                    console.log(`person not found in db`);
                    return;
                } else {
                    console.log(`person ${this.gedid} found in db`);
                    this.gedcomIndividual = i;
                    console.log(`${i.toString()}`)
                    let n = this._names();
                    if( n ) {
                        this.names = n;
                    } else {
                        console.log(`no names for this person!!!`)
                        return;
                    }
                    let b = this._birthday();
                    console.log(`got back ${b}`)
                    if(b && ((!Array.isArray(b)) || (Array.isArray(b) && b.length ))) {
                        this.birthday = b;
                        console.log(`person ${this.gedid} birthday set to ${this.birthday}`)
                    }
                    let d = this._deathday();
                    if(d && ((!Array.isArray(d)) || (Array.isArray(d) && d.length ))) {
                        this.deathday = d;
                    }
                    this.gedDataAvailable = true;
                    this.requestUpdate();

                }


            } else {
                console.log(`in PersonBio; getDefined called with GedData but value unreachable`)
            }
        } else {
            console.log(`in PersonBio; gedDefined called when GedData not defined`)
        }
    }

    private _birthday() {
        console.log(`in birthday, ged id is ${this.gedid}`);
        if(this.gedcomIndividual) {
            let r = this.gedcomIndividual.getEventBirth()
                .getDate()
                .valueAsDate()
                .map(d =>{
                    if(d && d.isDatePunctual) {
                        const datePart = (d as rgc.ValueDatePunctual).date;
                        const j = toJsDate(datePart);
                        console.log(`in birthday returning ${j}`);
                        return j;
                    } else {
                        return null;
                    }
                })
            r = r.filter((e,i) => {
                return (e !== null);
            })
            return r;
        } else {
            return "Unknown";
        }
    }

    private _deathday() {
        console.log(`in deathday, ged id is ${this.gedid}`);
        if(this.gedcomIndividual) {
            let r = this.gedcomIndividual.getEventDeath()
                .getDate()
                .valueAsDate()
                .map(d =>{
                    if(d && d.isDatePunctual) {
                        const datePart = (d as rgc.ValueDatePunctual).date;
                        const j = toJsDate(datePart);
                        console.log(`in birthday returning ${j}`);
                        return j;
                    } else {
                        return null;
                    }
                })
            r = r.filter((e,i) => {
                return (e !== null);
            })
            return r;
        } else {
            return "Waiting for Database to be populated";
        }
    }

    private _names() {
        console.log(`in names, ged id is ${this.gedid}`);
        if(this.gedcomIndividual) {
            const n =  this.gedcomIndividual.getName()
            console.log(`n with length ${n.length} and content ${n.toString()}`);
            return n;
        } else { console.log(`names 1`)}

    }


    render() {
        if(this.url) {
            console.log(`in PersonBio render, url is of type ${typeof(this.url)}`);
            console.log(`in PersonBio render, url is ${this.url}`);
            let t = html`
                <gedcom-db url="${this.url}" ${ref(this.GedData)} ></gedcom-db>
            `;
            if(this.gedDataAvailable && this.names ) {
                console.log(`in render ${this.names.toString()}`)
                const gn = this.names.getGivenName().valueNonNull();
                const nn = this.names.getNickname().valueNonNull();
                const sn = this.names.getSurname().valueNonNull();
                const ns = this.names.getNameSuffix().valueNonNull();
                t = html`
                    ${t}
                    Name: ${gn} ${(nn.length) ? `(${nn.toString()}` : '' } ${(ns.length) ? ns.toString() : '' } <br/>
                    Surname(s): ${sn.map((s) => html`${s}<br/>`)} 
                `
            }

            if(this.gedDataAvailable && this.birthday){
                t = html`${t}Birthday: ${this.birthday}<br/>`
            }
            if(this.gedDataAvailable && this.deathday){
                t = html`${t}Deathday: ${this.deathday}<br/>`
            }
            return html`${t}`;
        } else {
            return html`
                Please Wait for Database to be initialized.
            `
        }

    }

}

customElements.define('person-bio', PersonBio)