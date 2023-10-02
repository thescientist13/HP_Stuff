import {LitElement, html,} from 'lit';
import type {PropertyValues, TemplateResult} from 'lit'
import {property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';

import { type InferGetStaticParamsType, type InferGetStaticPropsType, type GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

import {TailwindMixin} from "../tailwind.element";

import {grampsDataController} from './state';

import {
    type ChildrefElement,
    type Event,
    type EventType,
    type Database,
    type Family,
    type Person,
    type PurpleChildref,
    type Noteref,
    type EventrefElement,
} from './GrampsTypes';

import style from '../../styles/Gramps.css?inline';

import {AncestorsTreeChart} from './AncestorsTreeChart'
import {IndividualName} from './individualName';
import {GrampsEvent} from "./events";
import {SimpleIndividual} from "./simpleIndividual";
import {GrampsIndividual} from "./individual";

type Params = InferGetStaticParamsType<typeof GrampsFamily.getStaticPaths>;
type Props = InferGetStaticPropsType<typeof GrampsFamily.getStaticPaths>;

export class GrampsFamily extends TailwindMixin(LitElement, style) {

    @property()
    public url: URL | string | null;

    @property({type: String})
    public grampsId: string;

    private grampsController = new grampsDataController(this);

    @state()
    private _family: Family | null;

    constructor() {
        super();

        this.url = null;
        this._family = null;
        this.grampsId = '';

    }

    public getStaticPaths = (async () => {
        const posts = await getCollection('docs');
        return posts.map((post) => {
            return {
                params: { slug: post.slug },
                props: { title: post.data.title },
            };
        });
    }) satisfies GetStaticPaths;

    public async willUpdate(changedProperties: PropertyValues<this>) {
        super.willUpdate(changedProperties)
        console.log(`willUpdate; url is ${this.url}`)
        if (this.url && (this.url.toString().localeCompare(this.grampsController.getUrl().toString()))) {
            console.log(`willUpdate; setting grampsController url`)
            this.grampsController.setUrl(new URL(this.url));
        }
        if(this.grampsController && this.grampsController.parsedStoreController && this.grampsController.parsedStoreController.value) {
            if(changedProperties.has("grampsId") && this.grampsId) {
                const db = this.grampsController.parsedStoreController.value.database;
                const r = db.families.family.filter((f) => {
                    return (!f.id.localeCompare(this.grampsId))
                }).shift();
                if(r) {
                    this._family = r;
                }
            }
        }
    }



}
customElements.define('gramps-family', GrampsFamily);
