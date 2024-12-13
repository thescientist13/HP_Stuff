export const prerender = true;

import {
  type Compilation,
  type Route,
  type Page,
  sortPages,
} from "../lib/greenwoodPages.ts";

import {
  getContentByCollection,
  getContentByRoute,
  //@ts-expect-error
} from "@greenwood/cli/src/data/client.js";

import { TopLevelSections } from "../lib/topLevelSections.ts";
//@ts-expect-error
import SpectrumSideNav from "@spectrum-css/sidenav" with { type: "css" };
import "@spectrum-web-components/sidenav/sp-sidenav.js";
import "@spectrum-web-components/sidenav/sp-sidenav-heading.js";
import "@spectrum-web-components/sidenav/sp-sidenav-item.js";

const DEBUG = 1;

export default class SideNav extends HTMLElement {
  private route: string = "";

  private async findChildren(route: string) {
    let tlsPage: Page | Page[] = await getContentByRoute(route);
    const childRoutes = new Array<string>();
    if (DEBUG) {
      console.log(
        `findChildren tlsPage for ${route} is ${Array.isArray(tlsPage) ? tlsPage.length : 0} entries`,
      );
    }
    if (!Array.isArray(tlsPage)) {
      console.log(`error, tlsPage for ${route} is not an array`);
      return [""];
    } else {
      const filterResult = tlsPage.filter((page: Page) => {
        return page.route.localeCompare(route);
      });
      if (filterResult.length) {
        await Promise.all(
          filterResult
            .sort((a, b) => sortPages(a, b))
            .map(async (fr) => {
              const r = fr.route.toString();
              const stacksize = r.split("/").length;
              if (DEBUG) {
                console.log(`route ${r} has stacksize ${stacksize}`);
              }
              if (stacksize > 0 && stacksize < 5) {
                childRoutes.push(r);
              }
            }),
        );
      }
    }
    return childRoutes;
  }
  private async buildTreeForRoute(route: string) {
    const templates = new Array<string>();
    let tlsPage: Page | Page[] = await getContentByRoute(route);
    let directory = false;
    const children = new Array<string>();
    if (Array.isArray(tlsPage)) {
      if (DEBUG) {
        console.log(`route ${route} is a directory`);
      }
      const filterResult = tlsPage.find((page: Page) => {
        return !page.route.localeCompare(route);
      });
      if (filterResult) {
        tlsPage = filterResult;
      } else {
        console.log(`bad filter result in buildTree`);
        return " ";
      }
      directory = true;
    }
    if (tlsPage != undefined && tlsPage != null) {
      if (directory) {
        const cr = await this.findChildren(route);
        if (cr.length) {
          await Promise.all(
            cr.map(async (acr) => {
              children.push(await this.buildTreeForRoute(acr));
            }),
          );
        } else {
          if (DEBUG) {
            console.log(`no children for ${route} which should be a directory`);
          }
        }
      }
      if (DEBUG) {
        console.log(`found tlsPage for ${route}`);
      }
      templates.push(`
      <sp-sidenav-item
        value="${tlsPage.id}"
        href="${tlsPage.route}"
        label="${tlsPage.label}"
      >
      <iconify-icon
        icon=${directory ? "lsicon:folder-filled" : "ep:document"}
        class="spectrum-Icon spectrum-Icon--sizeM"
        slot="icon"
      ></iconify-icon>
        ${children.length && children.join(" ")}
      </sp-sidenav-item>
    `);
      if (DEBUG) {
        console.log(`I have ${templates.length} templates in the array`);
      }
    } else {
      console.log(`undefined tlsPage for ${tls}`);
    }
    return templates.join(" ");
  }
  private async buildTree() {
    const templates = new Array<string>();
    await Promise.all(
      TopLevelSections.options
        .sort((a, b) => {
          return a.replace(" ", "").localeCompare(b.replace(" ", ""));
        })
        .map(async (tls) => {
          if (DEBUG) {
            console.log(`tree for ${tls}`);
          }
          const tlsAsRoute = `/${tls.replace(" ", "")}/`;
          const tlsTemplate = await this.buildTreeForRoute(tlsAsRoute);
          templates.push(tlsTemplate);
        }),
    );
    if (DEBUG) {
      console.log(`at end I have ${templates.length} templates in the array`);
    }
    return `
    <sp-sidenav>
      ${templates.join(" ")}
    </sp-sidenav>
    `;
  }
  async connectedCallback() {
    const _changedProperties = this.getAttributeNames();
    if (_changedProperties.includes("route")) {
      this.route = this.getAttribute("route") ?? "";
    }
    this.innerHTML = await this.buildTree();
  }
}
customElements.define("side-nav", SideNav);
