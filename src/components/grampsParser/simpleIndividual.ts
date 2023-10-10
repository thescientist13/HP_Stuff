import {LitElement, html, nothing} from 'lit';
import type {PropertyValues, TemplateResult} from 'lit'
import {property, state} from 'lit/decorators.js';

import {TailwindMixin} from "../tailwind.element";

import {zodData} from './state';

import {type Database, type Person} from '@lib/GrampsZodTypes';

import styles from '@styles/Gramps.css';

import {IndividualName} from './individualName';
import {GrampsEvent} from "./events";
import {withStores} from "@nanostores/lit";

export class SimpleIndividual extends TailwindMixin(withStores(LitElement, [zodData]), styles) {

    @property({type: String})
    public grampsId: string;

    @property ({type: Boolean})
    public showBirth: boolean;

    @property({type: Boolean})
    public showDeath: boolean;

    @property({type: Boolean})
    public showDate: boolean

    @property({type: Boolean})
    public asRange: boolean;

    @property({type: Boolean})
    public showGender: boolean;

    @property({type: Boolean})
    public asLink: boolean;

    @property({type: Boolean})
    public showPlace: boolean;

    @state()
    private individual: Person |  null;

    constructor() {
        super();

        this.grampsId = '';
        this.individual = null;
        this.showBirth = false;
        this.showDeath = false;
        this.showDate = false;
        this.showGender = false;
        this.showPlace = false;
        this.asLink = false;
        this.asRange = false;

    }

    public async willUpdate(changedProperties: PropertyValues<this>) {
        super.willUpdate(changedProperties)
        console.log(`willUpdate; `)

    }

    public render() {
        let t = html``
        if (zodData) {
            const db: Database | null = zodData.get();
            if (this.grampsId && db) {
                console.log(`render; id is ${this.grampsId} && I have a db`)
                const filterResult = db.people.person.filter((v) => {
                    return (!v.id.localeCompare(this.grampsId, undefined, {sensitivity: 'base'}))
                })
                if (filterResult && filterResult.length > 0) {
                    console.log(`render; filter returned ${filterResult.length} people`)
                    const first: Person | undefined = filterResult.shift();
                    if (first !== undefined) {
                        console.log(`render; first has id ${first.id}`);
                        this.individual = first;
                        t = html`${t}<individual-name grampsId=${this.grampsId} link=${this.asLink || nothing} ></individual-name>`
                        const eventRefs = this.individual.eventref;
                        if(this.asRange) {
                            t = html`${t} ( `
                        }
                        if(this.showBirth && this.grampsId && eventRefs) {
                            console.log(`render; birth is true and I have events`);
                            t = html`${t} <gramps-event grampsId=${this.grampsId} showBirth ></gramps-event>`
                        }
                        if(this.asRange) {
                            t = html`${t} -`
                        }
                        if(this.showDeath && this.grampsId && eventRefs ) {
                            console.log(`render; death is true and I have events`);
                            t = html`${t} <gramps-event grampsId=${this.grampsId} showDeath ></gramps-event>`
                        }
                        if(this.asRange) {
                            t = html`${t} )`
                        }
                    }
                }
            }
        }
        return html`${t}`;
    }
}
customElements.define('simple-individual', SimpleIndividual);
