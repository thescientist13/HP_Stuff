import {LitElement, unsafeCSS} from "lit";

import style from "../styles/tailwind.css?inline";

const tailwindElement = unsafeCSS(style);

type Constructor<T = {}> = new (...args: any[]) => T;
export const TailwindMixin = <T extends Constructor<LitElement>>(superClass: T, style: string) =>
    class extends LitElement {

        static styles = [tailwindElement, unsafeCSS(style)];
    
    };
