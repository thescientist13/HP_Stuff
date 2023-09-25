import {LitElement, css,unsafeCSS} from "lit";

import style from "../styles/tailwind.css?inline";

import { library, dom as fontAwesomeDom } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'


const tailwindElement = unsafeCSS(style);

type Constructor<T = {}> = new (...args: any[]) => T;
export const TailwindMixin = <T extends Constructor<LitElement>>(superClass: T, style: string) =>
    class extends LitElement {
        constructor() {
            super();
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

        static styles = [tailwindElement, unsafeCSS(style),css`
          ${unsafeCSS(fontAwesomeDom.css())}
        `];

    };
