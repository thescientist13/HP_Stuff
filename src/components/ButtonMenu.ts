import {LitElement, html, css, unsafeCSS, nothing} from 'lit';
import type { PropertyValues, TemplateResult } from 'lit'
import {property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import { library, dom as fontAwesomeDom } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

import {TailwindMixin} from "./tailwind.element";

import { z } from "zod";

import style from '../styles/ButtonMenu.css?inline'

export class ButtonMenu extends LitElement {

    constructor() {
        super();

        //fontawesome
        library.add(fas, far, fab)

    }

    connectedCallback() {
        super.connectedCallback()

        // @ts-ignore
        fontAwesomeDom.watch({
            autoReplaceSvgRoot: this.renderRoot,
            observeMutationsRoot: this.renderRoot,
        });
    }

    private buttonClasses = {
        'items-center': true,
        'rounded-full': true,
        'bg-gray-100': true,
        'text-gray-400': true,
        'hover:text-gray-600': true,
        'focus:outline-none': true,
        'focus:ring-2': true,
        'focus:ring-indigo-500': true,
        'focus:ring-offset-2': true,
        'focus:ring-offset-gray-100': true,
    }

    static styles=css`
      ${unsafeCSS(fontAwesomeDom.css())}
      
    `
    render() {
        const t = html`
            <div class="relative inline-block text-left">
                <div>
                    <button type="button" class="flex ${classMap(this.buttonClasses)}" id="menu-button" aria-expanded="true" aria-haspopup="true">
                        <i class="fa-solid fa-ellipsis-vertical fa-2xs"></i>
                    </button>
                </div>
            </div>
            `

        return html`${t}`

    }
}
customElements.define('button-menu', ButtonMenu);

