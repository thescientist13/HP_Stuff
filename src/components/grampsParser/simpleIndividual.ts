import {LitElement, html, nothing} from 'lit';
import type {PropertyValues, TemplateResult} from 'lit'
import {property, state} from 'lit/decorators.js';

import {TailwindMixin} from "../tailwind.element";

import {grampsDataController} from './state';

import {type Database, type Person} from './GrampsTypes';

import style from '../../styles/Gramps.css?inline';

import {IndividualName} from './individualName';
import {GrampsEvent} from "./events";

export class SimpleIndividual extends TailwindMixin(LitElement, style) {

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

    private grampsController = new grampsDataController(this);

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
        console.log(`simpleIndividual willUpdate; `)

    }

    public render() {
        let t = html``
        if (this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
            console.log(`simpleIndividual render; validated controller`)
            const db: Database = this.grampsController.parsedStoreController.value.database;
            if (this.grampsId) {
                const filterResult = db.people.person.filter((v) => {
                    return v.id === this.grampsId
                })
                if (filterResult && filterResult.length > 0) {
                    console.log(`simpleIndividual render; filter returned people`)
                    const first = filterResult.shift();
                    if (first) {
                        console.log(`simpleIndividual render; and the first was valid`);
                        this.individual = first;
                        t = html`${t}<individual-name grampsId=${this.grampsId} link=${this.asLink || nothing} ></individual-name>`
                        const eventRefs = this.individual.eventref;
                        if(this.asRange) {
                            t = html`${t} ( `
                        }
                        if(this.showBirth && this.grampsId && eventRefs) {
                            console.log(`simpleIndividual render; birth is true and I have events`);
                            t = html`${t} <gramps-event grampsId=${this.grampsId} showBirth ></gramps-event>`
                        }
                        if(this.asRange) {
                            t = html`${t} -`
                        }
                        if(this.showDeath && this.grampsId && eventRefs ) {
                            console.log(`simpleIndividual render; death is true and I have events`);
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
