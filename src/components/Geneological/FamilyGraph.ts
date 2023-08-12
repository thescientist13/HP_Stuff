import { LitElement, html } from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import type { Ref } from 'lit/directives/ref';
import {when} from 'lit/directives/when.js';
import { StoreController } from "@nanostores/lit";
import type { GedcomDb } from './database';
import type { SelectionGedcom } from 'read-gedcom';
import * as rgc from "read-gedcom";
import {toJsDate, parseNameParts} from "read-gedcom";

type Props = Record<string, never>

@customElement('family-graph')
export class FamilyGraph extends LitElement {

    @property()
    public surn: string | null;

    @property()
    public url: string | null;

    @state()
    protected GedData: Ref<HTMLInputElement> = createRef();

    private gcDB: rgc.SelectionGedcom | null;

    @state()
    private gedDataAvailable: boolean;

    @state()
    private gedcomFamily: rgc.SelectionIndividualRecord[];

    public constructor() {
        super();

        this.surn = null;
        this.url = null;
        this.gcDB = null
        this.gedcomFamily = [];
        this.gedDataAvailable = false;
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
        if ((typeof(this.surn) === 'undefined') || (this.surn === '')) {
            console.log(`I cannot find a undefined surname`)
            return;
        } else {
            if(this.GedData && this.GedData.value) {
                let m: rgc.SelectionIndividualRecord[] = [];
                let g = (this.GedData.value as unknown as GedcomDb).GedData;
                if(g){
                    this.gcDB = g;
                    console.log(`in PersonBio gedDefined looking for "${this.surn}"`);
                    g.getIndividualRecord().arraySelect().forEach(i => {
                        const s = (i.getName() as rgc.SelectionNamePieces).filterSelect(nameField => !(nameField as rgc.SelectionName).getType().value().includes(rgc.ValueNameType.Married)).getSurname().value();
                        if((s !== null) && (typeof(s) !== 'undefined')) {
                            console.log('type is ' + typeof(s));
                            if(Array.isArray(s)) {
                                s.forEach(v => {
                                    if (v !== null) {
                                        if (v.normalize() === this.surn!.normalize()) {
                                            m.push(i);
                                        }
                                    }
                                })
                            } else if(typeof(s) === 'string') {
                                if((s as string).normalize() === this.surn!.normalize()) {
                                    m.push(i);
                                }
                            } else {
                                console.log('entry neither a string nor array');
                            }
                        }
                    })
                    console.log('about to return, m is at ' + m.length);
                    this.gedcomFamily = m;
                }
            }
        }
    }

    render() {
        if (this.url) {
            console.log(`in PersonBio render, url is of type ${typeof (this.url)}`);
            console.log(`in PersonBio render, url is ${this.url}`);
            let t = html`
                <!-- Family Graph -->
                <gedcom-db url="${this.url}" ${ref(this.GedData)}></gedcom-db>
            `;
            const lis = [];
            for (const i of this.gedcomFamily) {
                const n = i.getName();
                let f: (string | null)[] | undefined = undefined;
                let l: (string | null)[] | undefined = undefined;
                let s: (string | null)[] | undefined = undefined;
                const iNamePartsNonMaiden: (null | (undefined | string)[])[] = i.getName()
                    .filterSelect(nameField => !(nameField as rgc.SelectionName).getType().value().includes(rgc.ValueNameType.Married)).valueAsParts();

                if( (iNamePartsNonMaiden!== null) && (typeof(iNamePartsNonMaiden) !== 'undefined')) {
                    console.log('values are: ' + iNamePartsNonMaiden);
                    f = i.getName().filterSelect(nameField => !nameField.getType().value().includes(rgc.ValueNameType.Married)).getGivenName().value();
                    l = i.getName().filterSelect(nameField => !nameField.getType().value().includes(rgc.ValueNameType.Married)).getSurname().value();
                    s = i.getName().filterSelect(nameField => !nameField.getType().value().includes(rgc.ValueNameType.Married)).getNameSuffix().value();
                    let PUrl = '';
                    if((typeof(f) !== 'undefined') && (f.length > 0) && (f[0] !== '') && (f[0] !== null)) {
                        PUrl = f[0].replace(/ /g, "_");
                    } else {
                        PUrl = '';
                    }
                    if((typeof(s) !== 'undefined') && (s.length > 0) && (s[0] !== '') && (s[0] !== null)) {
                        PUrl = PUrl + `_${s}`;
                    }
                    let target = new URL(PUrl.toLowerCase(), this.url);
                    lis.push(html`<li><a href="${target}">${f} ${l} ${s}</a></li>`);

                } else {
                    console.log('why is n null?');
                }
            }
            t =  html`
                ${t}
                <h4 class="h3">${this.surn}</h4>
                We have ${this.gedcomFamily.length} members of the ${this.surn} family.
                <ul>
                    ${lis}
                </ul>
            `;

            return html`${t}`;
        } else {
            return html`
                <!-- Family Graph -->
            `
        }
    }

}
