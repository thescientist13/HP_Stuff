import type {  ChildPart, TemplateResult} from 'lit';
import { html,  LitElement, noChange, nothing} from 'lit';
import {AsyncDirective,  directive} from 'lit/async-directive.js';
import type { PartInfo} from 'lit/directive.js';
import {customElement, queryAssignedNodes, state} from 'lit/decorators.js';
import {createRef, ref} from 'lit/directives/ref.js'
import {until} from 'lit/directives/until.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {when} from 'lit/directives/when.js';
import type {Ref, RefOrCallback} from 'lit/directives/ref';
import {provide, createContext} from '@lit-labs/context';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Observable, Subscription } from 'rxjs';
import { AsyncSubject, from } from 'rxjs';
import mermaid from "mermaid";
import type {RenderResult} from "mermaid";

@customElement('mermaid-diagram')
export class MermaidDiagram extends LitElement {

    private mermaidSubject = new AsyncSubject();

    private mermaidDivRef = createRef();

    private result: Observable<RenderResult> | null = null;

    private slotHtml: string | null = null;

    @state()
    protected mdc: Node | Node[] | null | undefined;

    public constructor() {
        super();

        this.mdc = null;
    }

    async connectedCallback() {
        super.connectedCallback();
        console.log(`connected Callback for mermaid-diagram`)


    }

    protected handleSlotChange(e) {
        console.log(`handleSlotChange called`)
        const childNodes = e.target.assignedNodes({flatten: true});
        const me = this.mermaidDivRef.value?.querySelector('slot');
        if(childNodes && me) {
            console.log(`in handleSlotChange, I found slot children`)
            this.mdc = childNodes;
            this.renderMermaid(this.mermaidDivRef.value)
        } else {
            console.log(`in handleSlotChange, I found no children`)
            this.mdc = null;
        }
    }

    protected renderMermaid(div?: Element) {
        console.log(`in renderMermaid`)
        if(div) {
            mermaid.initialize({
                htmlLabels: true,
                logLevel: 'debug',
                securityLevel: 'antiscript',
                startOnLoad: false,
                wrap: true,

            });
            let CP_slot = div.querySelector('slot');
            if(CP_slot) {
                console.log(`I found the slot`)
                const sc = CP_slot.assignedNodes({flatten: true});
                if(sc && sc.length) {
                    console.log(`I found ${sc.length} slot children`)
                    if(sc[0] && sc[0].parentElement) {
                        const para = sc[0].parentElement.querySelector('p')
                        let result: Promise<RenderResult>
                        if(para) {
                            this.result = from(mermaid.render('graph',para.innerHTML));
                        } else {
                            this.result = from(mermaid.render('graph',sc[0].parentElement.innerHTML));
                        }
                    } else {
                        console.error (`my slot child had no parent`)

                    }

                } else {
                    if(sc) {
                        console.error(`sc has no length`)
                    } else {
                        console.error(`there was no sc`)
                    }
                }
            } else {
                console.error(`no slot found`)
            }
        } else {
            console.error(`I have no div`)
        }
        if(this.result) {
            console.log(`setting subscribe`)
            this.result.subscribe((s) => {
                console.log(`setting slotHtml`)
                const { svg } = s;
                this.slotHtml = svg;
                this.requestUpdate()
            });
        }
        console.log(`end of renderMermaid`)
   }

    render() {

        return html`
            <div class="MermaidDiagram" ${ref(this.mermaidDivRef)} >
                
                <div class="mermaid">
                    ${when(this.slotHtml, () => {
                            return html`${unsafeHTML(this.slotHtml)}`
                        }, () => { 
                          return html`<slot @slotchange=${this.handleSlotChange} ></slot>`
                        })}
                </div>
            </div>
        `
    }

}

declare global {
    interface HTMLElementTagNameMap {
        "mermaid-diagram": MermaidDiagram;
    }
}