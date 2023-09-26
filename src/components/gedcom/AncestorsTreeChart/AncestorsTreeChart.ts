import {LitElement, html, nothing} from 'lit';
import type { PropertyValues, TemplateResult } from 'lit'
import {property, state} from 'lit/decorators.js';

import { z } from "zod";

import { SelectionIndividualRecord } from 'read-gedcom';
import { IndividualName } from '../individual/IndividualName';

import { gedcomDataController, gcDataContext } from '../state/database';

import {TailwindMixin} from "../../tailwind.element";

import style from '../../../styles/AncestorsTreeChart.css?inline'

export class AncestorsTreeChart extends TailwindMixin(LitElement,style) {
    
    @state()
    public gcDataController = new gedcomDataController(this);
    
    @property({type: String})
    public gedId: string;
    
    @property({type: Number})
    public maxDepth: number;
    
    @state()
    individual: SelectionIndividualRecord | null;
    
    constructor() {
        super();
        
        this.gedId = '';
        this.maxDepth = 3;
        this.individual = null;
    }
    
    private renderTreeLi (individual: SelectionIndividualRecord, maxDepth: number, isRoot: boolean = false):TemplateResult<1> | null  {
        const familyOpt = individual.getFamilyAsChild();
        let child: TemplateResult<1> | null = null;
        if (maxDepth > 0 && familyOpt.length > 0) {
            const family = familyOpt;
            const husband = family.getHusband().getIndividualRecord();
            const wife = family.getWife().getIndividualRecord();
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
                    <individual-name gedId=${individual.pointer()} link=${isRoot ? nothing : true} />
                </span>
            </li>
        `
    }
    
    public render() {
        if(this.gedId ) {
            if(this.gcDataController && this.gcDataController.gedcomStoreController && this.gcDataController.gedcomStoreController.value) {
                this.individual = this.gcDataController.gedcomStoreController.value.getIndividualRecord(this.gedId)
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
    gedId: z.string(),
    maxDepth: z.number().default(3).optional(),
});

export type AncestorsTreeChartProps = z.infer<typeof ancestorsTreeChartProps>;
