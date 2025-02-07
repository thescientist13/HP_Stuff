import {html, LitElement, type PropertyValues, type TemplateResult, nothing} from 'lit';
import {property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';

const DEBUG = false;

import { z} from "zod";
import {DateTime, Interval} from 'luxon';

import { zodData } from './state';

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
    type Export,
    PersonrefSchema
} from '@lib/GrampsZodTypes';

import {TailwindMixin} from "../tailwind.element";

import styles from '../../styles/Event.css?inline'
import {withStores} from "@nanostores/lit";

export class GrampsEvent extends TailwindMixin(withStores(LitElement, [zodData]),styles) {

    @property({type: String, reflect: true})
    public eventId: string;

    @state()
    private _event: Event | null;

    @property({type: String})
    public grampsId: string;

    @property({type: String})
    public grampsId2: string;

    @property({type: String})
    public familyId: string;

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
        this.familyId = '';
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

        if (zodData) {
            if (DEBUG) console.log(`willUpdate; controlers are ready to render`)
            const db = zodData.get();
            if (changedProperties.has('grampsId') && this.grampsId && db) {
                const filterResult = db.people.person.filter((v) => {
                    return v.id === this.grampsId
                })
                if (filterResult && filterResult.length > 0) {
                    if (DEBUG) console.log(`willUpdate; filter returned ${filterResult.length} people`)
                    const first: Person | undefined = filterResult.shift();
                    if (first !== undefined) {
                        if (DEBUG) console.log(`willUpdate; and the first was valid`);
                        this._i1 = first;
                        if (DEBUG) console.log(`willUpdate; I first need to find the event`)
                        if(this.showBirth ) {
                            if (DEBUG) console.log(`willUpdate; looking for a birth record for ${this.grampsId}`)
                            if(this._i1) {
                                const e = this.findBirthByPerson(this._i1);
                                if(e) {
                                    if (DEBUG) console.log(`willUpdate; e found with id ${e.id}`)
                                    this.eventId = e.id;
                                    this._event = e;
                                }
                            }
                        }
                        if(this.showDeath) {
                            if (DEBUG) console.log(`willUpdate; I am looking for a death record`)
                            if(this._i1) {
                                const e = this.findDeathByPerson(this._i1);
                                if(e) {
                                    this.eventId = e.id;
                                    this._event = e;
                                }
                            }
                        }
                    }
                } else {
                    console.error(`willUpdate; cannot find person for ${this.grampsId}`)
                }
            }
            if(changedProperties.has('familyId') && this.familyId && db) {
                if(this.showMarriage) {
                    if (DEBUG) console.log(`render; looking for marriage event of ${this.familyId}`);
                    const family = db.families.family.filter((f) => {
                        return (!f.id.localeCompare(this.familyId))
                    }).shift();
                    if(family && family.eventref) {
                        const fer = family.eventref.hlink;
                        const gme = db.events.event.filter((f) => {
                            return (!f.handle.localeCompare(fer))
                        }).shift();
                        if(gme) {
                            this.eventId = gme.id;
                            this._event = gme;
                        }
                    }
                }
            }
        }
    }

    private findDeathByPerson(individual: Person) {
        if (DEBUG) console.log(`findBirthByPerson; start`)
        const db = zodData.get();
        if(db) {
            if (DEBUG) console.log(`findDeathByPerson; I have a db`)
            const events = this.findEventsByPerson(individual);
            if(events) {
                if (DEBUG) console.log(`findBirthByPerson; person has ${events.length} events`)
                return events.filter(e => {
                    return (e.type === 'Death')
                }).shift();
            }
        }
        return null;
    }

    public findBirthByPerson(individual: Person) {
        if (DEBUG) console.log(`findBirthByPerson; start`)
        const db = zodData.get();
        if(db) {
            if (DEBUG) console.log(`findBirthByPerson; I have a db`)
            const events = this.findEventsByPerson(individual);
            if(events) {
                if (DEBUG) console.log(`findBirthByPerson; person has ${events.length} events`)
                return events.filter(e => {
                    if (DEBUG) console.log(`e.type is ${e.type}`)
                    return (e.type === 'Birth')
                }).shift();
            }
        }
        return null;
    }

    public findEventsByPerson(individual: Person):  Event[] | null {
        if (DEBUG) console.log(`findEventsByPerson; start`)
        const refs: EventrefElement | EventrefElement[] | undefined | null = individual.eventref;
        const db = zodData.get();
        if(db && refs !== null && refs !== undefined) {
            if (DEBUG) console.log(`findEventsByPerson; I have refs to search`)
            const r: EventrefElement[] = [refs].flat()
            const returnable =  db.events.event.filter((e) => {
                const _id = e.handle;
                if(_id) {
                    let result = Array<boolean>();
                    r.forEach((ref) => {
                        const link = ref.hlink;
                        if(!_id.localeCompare(link)) {
                            if (DEBUG) console.log(`findEventsByPerson; found event for person`)
                            result.push(true);
                        }
                    })
                    if(result.includes(true)) {
                        return true;
                    }
                }
                return false;
            })
            if(returnable !== null && returnable !== undefined) {
                return returnable;
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
                d2 = DateTime.fromISO(event.daterange.stop)
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
                d2 = DateTime.fromISO(event.datespan.stop)
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
        if (zodData) {
            if (DEBUG) console.log(`render; controllers are ready to render`)
            const db = zodData.get();
            if(this.eventId && db) {
                if (DEBUG) console.log(`render; I know which event to work with`)
                const e = db.events.event.filter((e) => {
                    return (!e.id.localeCompare(this.eventId))
                }).shift();
                if(e && !this._event) {
                    this.eventId = e.id;
                    this._event = e;
                }
                t = html`${t}${this.displayDate(this._event!)}`
            }
        }

        return html`${t}`;
    }

}
customElements.define('gramps-event', GrampsEvent);

