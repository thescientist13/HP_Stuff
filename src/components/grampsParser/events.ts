import {html, LitElement, PropertyValues, type TemplateResult} from 'lit';
import {property, state} from 'lit/decorators.js';

import { z} from "zod";

import { grampsDataController } from './state';

import {type Database, type Event, type NameElement, type Person} from './GrampsTypes';

import {TailwindMixin} from "../tailwind.element";

import style from '../../../styles/Individual.css?inline'

export class IndividualEvents extends TailwindMixin(LitElement,style) {

    @state()
    public gcDataController = new grampsDataController(this);

    @property({type: String})
    public grampsId: string;

    @property({type: String})
    public grampsId2: string;

    @property({type: Boolean})
    public simpleDate: boolean;

    @property({type: Boolean})
    public showDeath: boolean;

    @property({type: Boolean})
    public showBirth: boolean;

    @property({type: Boolean})
    public showBDRange: boolean;

    @property({type: Boolean})
    public showOther: boolean;

    @property({type: Boolean})
    public simplePlace: boolean;

    @property({type: Boolean})
    public showPlace: boolean;

    @property({type: Boolean})
    public showMarriage: boolean

    @state()
    private individual: Person | null;

    @state()
    private i2: Person | null;

    constructor() {
        super();

        this.grampsId = '';
        this.grampsId2 = '';
        this.individual = null;
        this.i2 = null;
        this.showBirth = false;
        this.showDeath = false;
        this.showMarriage = false;
        this.showBDRange = false;
        this.showOther = false;
        this.simpleDate = false;
        this.simplePlace = false;
        this.showPlace = false;

    }

    private renderEventPlace(event: Event, t: TemplateResult<1>) {
        if(this.showPlace) {
            const eventPlace =  event.getPlace().value().map(place => {
                //the noPlace flag is supposed to prevent this from being false, but check
                if(place) {
                    return place.split(',').map(s => s.trim()).filter(s => s)
                } else {
                    throw new Error('Event place unset and noPlace flag set to false')
                }
            }).map(parts => {
                if(this.simplePlace && parts) {
                    return parts[0]
                } else {
                    return parts.join(', ')
                }
            })[0];
            t = html`${t} - ${eventPlace}`
        }
        return t;
    }

    public async willUpdate(changedProperties: PropertyValues<this>) {
        super.willUpdate(changedProperties)

    }

    render() {
        if (this.gcDataController && this.gcDataController.grampsStoreController && this.gcDataController.grampsStoreController.value) {
            if(this.showMarriage){
                if(this.grampsId && this.grampsId2) {
                    this.individual = this.gcDataController.getIndividualRecord(this.grampsId);
                    this.i2 = this.gcDataController.getIndividualRecord(this.grampsId2);
                    if(this.individual && this.i2) {
                        console.log(`IndividualEvents render; both people found`)
                        const family = this.individual.getFamilyAsSpouse().filterSelect(f => {
                            const h = f.getHusband();
                            const w = f.getWife();
                            if((h.getIndividualRecord().pointer()[0] === this.grampsId) || (w.getIndividualRecord().pointer()[0] === this.grampsId)) {
                                if((h.getIndividualRecord().pointer()[0] === this.grampsId2) || (w.getIndividualRecord().pointer()[0] === this.grampsId2)) {
                                    return true;
                                }
                            }
                            return false;
                        })
                        const marriage = family.getEventMarriage();
                        if(marriage.length > 0) {
                            console.log(`IndividualEvents render Marriage; marriage length > 0`)
                            if(marriage.getDate().valueNonNull().length > 0) {
                                let md = marriage.getDate().arraySelect().map(date => {
                                    console.log(`IndividualEvents render Marriage; date is ${date.valueNonNull().toString()}`);
                                    return displayDate(date, this.simpleDate)
                                })[0];
                                let t = html`${md}`
                                t = this.renderEventPlace(marriage,t);
                                return t;
                            } else {
                                console.log(`IndividualEvents render Marriage; getDate valueNonNull size 0`);
                            }
                        } else {
                            console.log(`IndividualEvents render Marriage; no marraige found`)
                        }

                    }
                }
                return html`Unknown Date`;
            }
        }
        if(this.grampsId) {
            this.individual = this.gcDataController.getIndividualRecord(this.grampsId);
            if(this.individual) {
                console.log(`IndividualEvents render; individual found`)
                if(this.showBDRange) {
                    let t = html`(`;
                    const b = this.individual.getEventBirth();
                    const d = this.individual.getEventDeath();
                    if(b.length !== 0) {
                        let birthDate = b.getDate().arraySelect().map(date => {
                            console.log(`IndividualEvent Birthday render; date is ${date.valueNonNull().toString()}`);
                            return displayDate(date,true);
                        })[0]
                        t = html`${t}${birthDate}`
                    } else {
                        t = html`${t} `
                    }
                    t = html`${t} - `
                    if(d.length !== 0 ) {
                        let birthDate = d.getDate().arraySelect().map(date => {
                            console.log(`IndividualEvent Birthday render; date is ${date.valueNonNull().toString()}`);
                            return displayDate(date,true)
                        })[0];
                        t = html`${t}${birthDate}`
                    }
                    return html`${t})`
                }
                let ta: TemplateResult<1>[] = [];
                if(this.showBirth) {
                    let t = html``;
                    const e = this.individual.getEventBirth()
                    if(e.length !== 0) {
                        let birthDate = e.getDate().arraySelect().map(date => {
                            console.log(`IndividualEvent Birthday render; date is ${date.valueNonNull().toString()}`);
                            return displayDate(date,this.simpleDate)
                        })[0];
                        t = html`${t}${birthDate}`
                        t = this.renderEventPlace(e,t);
                    }
                    ta.push(t);
                }
                if(this.showDeath) {
                    let t = html``;
                    const e = this.individual.getEventDeath()
                    if(e.length !== 0) {
                        let deathDate = e.getDate().arraySelect().map(date => {
                            console.log(`IndividualEvent DeathDate render; date is ${date.valueNonNull().toString()}`);
                            return displayDate(date,this.simpleDate)
                        })[0];
                        t = html`${t}${deathDate}`
                        t = this.renderEventPlace(e,t);
                    }
                    ta.push(t)
                }
                return ta;
            }
            console.error(`could not find individual`);

        }
        return html``;

    }

}
customElements.define('individual-events', IndividualEvents);

