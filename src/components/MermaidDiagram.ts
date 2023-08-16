import type {ChildPart, TemplateResult} from 'lit';
import {html, LitElement, noChange} from 'lit';
import {AsyncDirective, directive} from 'lit/async-directive.js';
import type {PartInfo} from 'lit/directive.js';
import {customElement, queryAssignedNodes, state} from 'lit/decorators.js';
import {createRef, ref} from 'lit/directives/ref.js'
import {until} from 'lit/directives/until.js';
import type {Ref} from 'lit/directives/ref';
import mermaid from "mermaid";


class DiagramSlotDirective extends AsyncDirective {
    private promise: boolean;

    private config

    protected mdc

    constructor(partInfo: PartInfo) {
        super(partInfo );
        this.promise = false;
        this.config = {
            htmlLabels: true,
            logLevel: 'debug',
            securityLevel: 'antiscript',
            startOnLoad: false,
            wrap: true,

        }
        this.mdc = [];
        mermaid.initialize(this.config);
    }

    update(part: ChildPart) {
        console.log(`DiagramSlotDirective update function called on `)
        console.log(`promise is ${this.promise}`)
        return this.render();
    }

    protected async handleSlotChange(e) {
        console.log(`slotchange Callback for mermaid-diagram`)
        const children = e.target.assignedNodes({flatten: true});
        if(!children) {
            console.error(`missing target`)
            return;
        }
        this.mdc = children.map((node) => {
            return node.cloneNode();
        })
        console.log(`mdc has length ${this.mdc.length}`)
        console.log(`found ${children}`)
        this.promise = true;
        this.update(e);
    }

    render () {
        console.log(`render for DiagramSlotDirective with promise state ${this.promise}`)
        if (!this.promise) {
            console.log(`top render`)
            let c = html`
                <div class="mermaid" >
                    <slot @slotchange=${this.handleSlotChange} ></slot>
                </div>               
            `
            return c;
        } else {
            console.log(`promise is defined`)
            console.log(`in final render, children now ${this.mdc}`)
                return html`
                    <div class="mermaid" >
                        
                    </div>
                    `

        }

    }



}

@customElement('mermaid-diagram')
export class MermaidDiagram extends LitElement {

    private mermaidSlot = directive(DiagramSlotDirective);

    public constructor() {
        super();

    }

    async connectedCallback() {
        super.connectedCallback();
        console.log(`connected Callback for mermaid-diagram`)

    }

    render() {
        return html`
            <div class="MermaidDiagram">
                    ${this.mermaidSlot()}
            </div>
        `
    }

}

declare global {
    interface HTMLElementTagNameMap {
        "mermaid-diagram": MermaidDiagram;
    }
}