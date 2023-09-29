import {LitElement, html,} from 'lit';
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

    @state()
    private individual: Person |  null;

    private grampsController = new grampsDataController(this);

    constructor() {
        super();

        this.individual = null;
        this.grampsId = '';
        this.showBirth = false;
        this.showDeath = false;
        this.showDate = false;
        this.asRange = false;
        this.showGender = false;
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
                        t = html`${t}<individual-name grampsId=${this.grampsId}></individual-name>`
                    }
                }
            }
        }
        return html`${t}`;
    }
}
customElements.define('simple-individual', SimpleIndividual);
