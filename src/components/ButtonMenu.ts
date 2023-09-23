import {LitElement, html, css, unsafeCSS, nothing} from 'lit';
import type { PropertyValues, TemplateResult } from 'lit'
import {property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {TailwindMixin} from "./tailwind.element";

import { z } from "zod";

import style from '../styles/ButtonMenu.css?inline'
import {dom as fontAwesomeDom} from "@fortawesome/fontawesome-svg-core";

export class ButtonMenu extends TailwindMixin(LitElement,style) {

    constructor() {
        super();

    }

    private buttonClasses = {
        'items-center': true,
        'rounded-full': true,
        'bg-lochmara-500': true,
        'hover:bg-lochmara-600': true,
        'focus:outline-none': true,
        'focus:ring-2': true,
        'focus:ring-indigo-500': true,
        'focus:ring-offset-2': true,
        'focus:ring-offset-gray-100': true,
    }

    render() {
        const t = html`
            <div class="relative inline-block text-left">
                <div>
                    <button type="button" class="flex ${classMap(this.buttonClasses)}" id="menu-button" aria-expanded="true" aria-haspopup="true">
                        <i class="fa-solid fa-ellipsis-vertical fa-lg"></i>
                    </button>
                </div>
            </div>
            `

        return html`${t}`

    }
}
customElements.define('button-menu', ButtonMenu);

