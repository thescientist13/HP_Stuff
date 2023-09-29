import {html, LitElement, type PropertyValues, type TemplateResult, nothing} from 'lit';
import {property, state} from 'lit/decorators.js';

import { z} from "zod";
import {DateTime, Interval} from 'luxon';

import { grampsDataController } from './state';

import {type Database, type Event, type EventrefElement, type NameElement, type Person} from './GrampsTypes';

import {TailwindMixin} from "../tailwind.element";

import style from '../../styles/Event.css?inline'

export class GrampsEvent extends TailwindMixin(LitElement,style) {

    @state()
    public gController = new grampsDataController(this);

    @property({type: String})
    public eventId: string;
    
    @state()
    private _event: Event | null;
    
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
    private _i1: Person | null;

    @state()
    private _i2: Person | null;

    constructor() {
        super();

        this.eventId = '';
        this._event  = null;
        this.grampsId = '';
        this.grampsId2 = '';
        this._i1 = null;
        this._i2 = null;
        this.showBirth = false;
        this.showDeath = false;
        this.showMarriage = false;
        this.showBDRange = false;
        this.showOther = false;
        this.simpleDate = false;
        this.simplePlace = false;
        this.showPlace = false;

    }

    public setEvent(e: Event | null | undefined) {
        if(e) {
            this._event = e;
        } else {
            this._event = null;
        }
    }

    public getEvent() {
        return this._event;
    }

    public async willUpdate(changedProperties: PropertyValues<this>) {
        super.willUpdate(changedProperties)
        
        if (this.gController && this.gController.parsedStoreController && this.gController.parsedStoreController.value) {
            console.log(`events render; controlers are ready to render`)
            const db: Database = this.gController.parsedStoreController.value.database;
            if (changedProperties.has('grampsId') && this.grampsId) {
                const filterResult = db.people.person.filter((v) => {
                    return v.id === this.grampsId
                })
                if (filterResult && filterResult.length > 0) {
                    console.log(`events willUpdate; filter returned people`)
                    const first = filterResult.shift();
                    if (first) {
                        console.log(`events willUpdate; and the first was valid`);
                        this._i1 = first;
                    }
                } else {
                    console.error(`cannont find person for ${this.grampsId}`)
                }
            }
        }

    }
    
    private findDeathByPerson(individual: Person) {
        console.log(`events findBirthByPerson; start`)
        const db = this.gController.parsedStoreController.value;
        if(db) {
            const events = this.findEventsByPerson(individual);
            if(events) {
                console.log(`events findBirthByPerson; person has ${events.length} events`)
                return events.filter(e => {
                    return (e.type === 'Death')
                }).shift();
            }
        }
        return null;
    }
    
    public findBirthByPerson(individual: Person) {
        console.log(`events findBirthByPerson; start`)
        const db = this.gController.parsedStoreController.value;
        if(db) {
            const events = this.findEventsByPerson(individual);
            if(events) {
                console.log(`events findBirthByPerson; person has ${events.length} events`)
                return events.filter(e => {
                    return (e.type === 'Birth')
                }).shift();
            }
        }
        return null;
    }
    
    public findEventsByPerson(individual: Person) {
        console.log(`events findEventsByPerson; start`)
        const refs:EventrefElement[] | EventrefElement | undefined = individual.eventref;
        const db = this.gController.parsedStoreController.value;
        if(db) {
            if(refs) {
                console.log(`events findEventsByPerson; I have refs to search`)
                const r = [refs].flat()
                return db.database.events.event.filter((e) => {
                    const _id = e.handle;
                    if(_id) {
                        let result = false;
                        r.forEach((ref) => {
                            const link = ref.hlink;
                            if(!_id.localeCompare(link)) {
                                console.log(`events findBirthByPerson; found event for person`)
                                result = true;
                            }
                        })
                        return result;
                    }
                    return false;
                })
            }
            
        }
        return null;
    }
    
    private displayDate(event: Event) {
        let t = html``
        let d: DateTime | null = null;
        let i: Interval | null = null;
        if(event.dateval) {
            if(event.dateval.type) {
                t = html`${event.dateval.type} `
            }
            if(typeof event.dateval.val === 'string') {
                d = DateTime.fromISO(event.dateval.val)
            } else{
                d = DateTime.fromISO(event.dateval.val.toString())
            }
        } else if (event.datestr) {
            d = DateTime.fromISO(event.datestr.val)
        }else if (event.daterange) {
            let d2: DateTime;
            if(typeof event.daterange.start === 'string') {
                d = DateTime.fromISO(event.daterange.start)
            } else  {
                d = DateTime.fromISO(event.daterange.start.toString())
            }
            if(typeof event.daterange.stop === 'number') {
                d2 = DateTime.fromISO(event.daterange.stop.toString())
            } else  {
                d2 = DateTime.fromJSDate(event.daterange.stop)
            }
            i = Interval.fromDateTimes(d, d2);
        }else if(event.datespan) {
            let d2: DateTime;
            if(typeof event.datespan.start === 'string') {
                d = DateTime.fromISO(event.datespan.start)
            } else {
                d = DateTime.fromISO(event.datespan.start.toString())
            }
            if(typeof event.datespan.stop === 'number') {
                d2 = DateTime.fromISO(event.datespan.stop.toString())
            } else {
                d2 = DateTime.fromJSDate(event.datespan.stop)
            }
            i = Interval.fromDateTimes(d, d2);
        }
        if(i) {
            return html`${t} ${d ? this.simpleDate ? i.toFormat('YYYY') : i.toISODate() : nothing}`
        }
        return html`${t} ${d ? this.simpleDate ? d.get('year') : d.toISODate() : nothing}`
    }

    public render() {
        let t = html``
        if (this.gController && this.gController.parsedStoreController && this.gController.parsedStoreController.value) {
            console.log(`events render; controlers are ready to render`)
            const db: Database = this.gController.parsedStoreController.value.database;
            if(this.eventId) {
                console.log(`events render; I know which event to work with`)
            } else {
                console.log(`events render; I first need to find the envent`)
                if(this.showBirth && this.grampsId) {
                    console.log(`events render; looking for a birth record for ${this.grampsId}`)
                    if(this._i1) {
                        const e = this.findBirthByPerson(this._i1);
                        if(e) {
                            this._event = e;
                            t= html`${t}${this.displayDate(this._event)}`
                        }
                    } else {
                        console.error(`events render; Cannot find a birth record without an individual`)
                    }
                } else {
                    console.error(`events render; asked to show a birth record with no gramps id`);
                }
                if(this.showDeath) {
                    console.log(`events render; I am looking for a death record`)
                    if(this._i1) {
                        const e = this.findDeathByPerson(this._i1);
                        if(e) {
                            this._event = e;
                            t= html`${t}${this.displayDate(e)}`
                        }
                    } else {
                        console.error(`events render; Cannot find a death record without an individual`)
                    }
                }
            }
        }
        
        return html`${t}`;
    }

}
customElements.define('gramps-event', GrampsEvent);

