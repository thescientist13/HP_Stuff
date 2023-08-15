import { LitElement, html, TemplateResult } from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef, ref } from 'lit/directives/ref.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { Ref } from 'lit/directives/ref';
import mermaid, { ExternalDiagramDefinition, MermaidConfig } from "mermaid";

@customElement('mermaid-diagram')
export class MermaidDiagram extends LitElement {

    @state()
    private allText: string;

    private config

    private slotRef: Ref<HTMLInputElement> = createRef();

    @state()
    renderedSvg: string | null;

    public constructor() {
        super();

        this.allText = '';
        this.config = {
            htmlLabels: true,
            logLevel: 'debug',
            securityLevel: 'antiscript',
            startOnLoad: false,
            wrap: true,

        }
        this.renderedSvg = null;
    }

    connectedCallback() {
        super.connectedCallback();
        console.log(`connected Callback for mermaid-diagram`)

        mermaid.initialize(this.config);

    }

    protected async handleSlotchange(e) {
        if(!this.renderedSvg) {
            const childNodes = e.target.assignedElements({flatten: true});
            console.log(`slotchange Callback for mermaid-diagram`)
            this.allText = childNodes.map((node) => {
                console.log(`found node with name ${node.localName}`)
                return node.innerHTML ? node.innerHTML : '';
            }).join ('\n');
            console.log(`found text ${this.allText}`)
            const { svg } = await mermaid.render('graphDiv',this.allText.replace(/#/g,'aaa'));
            this.renderedSvg = svg.replace(/aaa/g, '#');
            console.log(`resulting svg is\n${svg}`)
        }

    }

    render() {
        if(!this.renderedSvg) {
            return html`
            <div class="mermaid">
                <slot @slotchange=${this.handleSlotchange} ${ref(this.slotRef)}/>
            </div>
        `
        } else {

            return html`
                <div class="mermaid">
                    ${unsafeSVG(this.renderedSvg)}
                </div>
            `
        }

    }

}

declare global {
    interface HTMLElementTagNameMap {
        "mermaid-diagram": MermaidDiagram;
    }
}