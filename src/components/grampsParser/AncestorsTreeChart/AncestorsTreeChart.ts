import {LitElement, html, nothing} from 'lit';
import type { PropertyValues, TemplateResult } from 'lit'
import {property, state} from 'lit/decorators.js';

import { z } from "zod";

import {
    type ChildrefElement,
    type PurpleChildref,
    type Database,
    type Family,
    type Person,
    type Noteref,
    type ChildrefUnion,
} from '../GrampsTypes';


import {grampsDataController} from '../state';
import {IndividualName} from '../individualName';
import {GrampsEvent} from "../events";
import {SimpleIndividual} from "../simpleIndividual";

import {TailwindMixin} from "../../tailwind.element";

import style from '../../../styles/AncestorsTreeChart.css?inline'

export class AncestorsTreeChart extends TailwindMixin(LitElement,style) {
    
    @state()
    public gcDataController = new grampsDataController(this);
    
    @property({type: String})
    public grampsId: string;
    
    @property({type: Number})
    public maxDepth: number;
    
    @state()
    individual: Person | null | undefined;
    
    constructor() {
        super();
        
        this.grampsId = '';
        this.maxDepth = 3;
        this.individual = null;
    }
    
    private renderTreeLi (individual: Person | undefined, maxDepth: number, isRoot: boolean = false):TemplateResult<1> | null  {
        if(individual && this.gcDataController && this.gcDataController.parsedStoreController && this.gcDataController.parsedStoreController.value && this.gcDataController.parsedStoreController.value.database) {
            const db = this.gcDataController.parsedStoreController.value.database
            const family = db.families.family.filter((f) => {
                if(individual.childof) {
                    const handle = f.handle;
                    const iHandle = [individual.childof].flat().shift()?.hlink
                    if(iHandle) {
                        return (!iHandle.localeCompare(handle))
                    }
                }
                return false;
            }).shift();
            let child: TemplateResult<1> | null = null;
            if (family) {
                const husbandRef = family.father?.hlink;
                const husband = db.people.person.filter((p) => {
                    if(p.handle && husbandRef) {
                        return (!p.handle.localeCompare(husbandRef))
                    }
                    return false;
                }).shift();
                const wifeRef = family.mother?.hlink;
                const wife = db.people.person.filter((p) => {
                    if(p.handle && wifeRef) {
                        return (!p.handle.localeCompare(wifeRef))
                    }
                    return false;
                }).shift();
                const currentDepth = maxDepth - 1;
                child = html`
                <ul>
                    ${this.renderTreeLi(husband, currentDepth, false)}
                    ${this.renderTreeLi(wife, currentDepth, false)}
                </ul>
            `
            }
            return html`
            <li>
                ${child}
                <span>
                    <individual-name grampsId=${individual.id} link=${isRoot ? nothing : true} />
                </span>
            </li>
        `
        }
        return null;
    }
    
    public render() {
        console.log(`render; start`)
        if(this.grampsId ) {
            if(this.gcDataController && this.gcDataController.parsedStoreController && this.gcDataController.parsedStoreController.value) {
                this.individual = this.gcDataController.parsedStoreController.value.database.people.person.filter((p) => {
                    return (!p.id.localeCompare(this.grampsId))
                }).shift()
                if(this.individual) {
                    return html`
                        <ul class="ascending-tree">
                            ${this.renderTreeLi(this.individual, this.maxDepth,true)}
                        </ul>
                    `
                
                }
            }
        }
        return html``;
    }
}
customElements.define('ancestorstree-chart', AncestorsTreeChart);

/*export function AncestorsTreeChart( individual, maxDepth }) {
    const
        return (
            <li>
                {child}
                <span>
                    <IndividualName individual={individual} noLink={isRoot} />
                </span>
            </li>
        );
    };

    return (
        <ul className="ascending-tree">
            {renderTreeLi(individual, maxDepth, true)}
        </ul>
    );
}
*/
const ancestorsTreeChartProps = z.object({
    grampsId: z.string(),
    maxDepth: z.number().default(3).optional(),
});

export type AncestorsTreeChartProps = z.infer<typeof ancestorsTreeChartProps>;
