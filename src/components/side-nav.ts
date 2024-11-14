import { LitElement, html, css, nothing, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { until } from "lit/directives/until.js";

import {
  getContentByCollection,
  getContentByRoute,
} from "@greenwood/cli/src/data/client.js";

import { TopLevelSections } from "../lib/topLevelSections.ts";
import SpectrumSideNav from "/node_modules/@spectrum-css/sidenav/dist/index.css" with { type: "css" };

const DEBUG = 0;

type Page = {
  id: string;
  title: string;
  label: string;
  route: string;
  data: {
    directory?: boolean;
  };
};

@customElement("side-nav")
export default class SideNav extends LitElement {
  @property({ reflect: true })
  public route: string = "";

  private findChildFiles(
    TopSection: string,
    SubSection: string,
    sectionContents: Page[],
  ) {
    if (DEBUG) {
      console.log(`findChildFiles ${TopSection} ${SubSection}`);
    }
    const sectionFileRoutes = new Array<string>();
    const sectionFiles = new Array<Page>();
    sectionContents
      .sort((a, b) => {
        return a.id.localeCompare(b.id);
      })
      .filter((section: Page) => {
        return section.route.startsWith(SubSection);
      })
      .filter((page: Page) => {
        return !page.id.endsWith("index");
      })
      .filter((page) => {
        const SectionRE = new RegExp(SubSection, "i");
        const r = page.route.replace(SectionRE, "").split("/");
        if (r.length == 2) {
          return 1;
        }
        return 0;
      })

      .map((section: Page) => {
        const candidate = section.route;
        if (candidate.localeCompare(this.route)) {
          if (!sectionFileRoutes.includes(candidate)) {
            if(DEBUG) {
              console.log(`findChildFiles pushing ${candidate}`);
            }
            sectionFileRoutes.push(candidate);
            sectionFiles.push(section);
          }
        }
      });
    if(DEBUG) {
      console.log(`SpectrumSideNav findChildFiles ${TopSection} ${SubSection} found ${sectionFiles.length}`);
    }
    return sectionFiles;
  }

  private findChildDirectories(
    TopSection: string,
    SubSection: string,
    sectionContents: Page[],
  ) {
    if (DEBUG) {
      console.log(
        `SpectrumSideNav findChildDirectories ${TopSection} ${SubSection}`,
      );
    }
    const sectionDirectories = new Array<Page>();
    const sectionDirectoryRoutes = new Array<string>();
    sectionContents
      .sort((a, b) => {
        return a.id.localeCompare(b.id);
      })
      .filter((page: Page) => {
        return page.route.startsWith(SubSection);
      })
      .filter((page: Page) => {
        const i = page.id.endsWith("index");
        return i;
      })
      .filter((page) => {
        const SectionRE = new RegExp(SubSection, "i");
        const r = page.route.replace(SectionRE, "").split("/");
        if (r.length == 2) {
          return 1;
        }
        return 0;
      })
      .sort((a: Page, b: Page) => {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.includes("title") && bKeys.includes("title")) {
          return a.title.localeCompare(b.title);
        }
        if (DEBUG) {
          console.log(`findChildDirectories a title is missing`);
        }
        return a.route.localeCompare(b.route);
      })
      .map((page: Page) => {
        const routeArray = page.route.split("/");
        const candidate = routeArray.slice(0, -1).join("/") + "/";
        if (!sectionDirectoryRoutes.includes(candidate)) {
          if(DEBUG) {
            console.log(`findChildDirectories pushing ${candidate}`);
          }
          sectionDirectoryRoutes.push(candidate);
          sectionDirectories.push(page);
        }
      });
    if (DEBUG) {
      console.log(
        `SpectrumSideNav findChildDirectories ${TopSection} ${SubSection} found ${sectionDirectories.length}`,
      );
    }
    return sectionDirectories;
  }

  private currentTopLevel() {
    if (this.route == null || this.route == undefined) {
      console.error(`route was null in currentTopLevel`);
      return null;
    }

    const sectionHeader = this.route.split("/")[1] ?? "TopIndex";
    if (DEBUG) {
      console.log(
        `SideNav getSectionContents sectionHeader is ${sectionHeader}`,
      );
    }
    const SectionRE = new RegExp(sectionHeader, "i");
    const TopSection = TopLevelSections.options.find((section) =>
      SectionRE.test(section),
    );
    if (TopSection != undefined) {
      return TopSection;
    } else {
      console.error(`no TopSection identified for route ${this.route}`);
      return null;
    }
  }

  private renderSingleEntry(
    TopSection: string,
    sectionContents: Page[],
    page: Page,
    depth: number = 0,
    directory?: boolean = true;
  ) {
    let isParent: boolean = false;
    const returnableTemplates = new Array<TemplateResult>();
    if (page == undefined || page.route == undefined) {
      if (page != undefined) {
        console.warn(`page defined with no route!! ${JSON.stringify(page)}`);
      } else {
        console.warn(`page undefined in args of renderSingleEntry`);
      }
      return null;
    } else {
      if (DEBUG) {
        console.log(`rendering ${page.route} at depth ${depth}`);
      }
      let testDepth = 2;
      if(
        page.route.startsWith(this.route) ||
        this.route.startsWith(page.route)
      ) {
        testDepth = this.route.split('/').length - 1;
        if(DEBUG) {
          console.log(`new testDepth for route ${this.route} is ${testDepth}`);
        }
      }
      if(directory && !this.route.localeCompare(TopSection)) {
        const routeArray = this.route.split('/');
        const pageArray = page.route.split('/');
        if(this.route.length > 1 && pageArray.length >= routeArray.length) {
          let match: boolean = true;
          routeArray.pop();
          routeArray.pop();
          for (let i = 0; i < routeArray.length; i++) {
            if(routeArray[i].localeCompare(pageArray[i])) {
              if(DEBUG) {
                console.log(`detected mismatch ${routeArray[i]} and ${page.route} at ${i}`)
              }
              match = false;
              break;
            }
          }
          if(match) {
            testDepth++;
          }
        }
        if(DEBUG) {
          console.log(`new testDepth for route ${this.route} page ${page.id} is ${testDepth}`);
        }
      }
      if (depth < testDepth || this.route.startsWith(page.route) ) {
        if (DEBUG) {
          console.log(`depth is ${depth} looking at children for ${page.id}`);
        }
        let selected = false;
        if (!page.route.toLowerCase().localeCompare(this.route.toLowerCase())) {
          if (DEBUG) {
            console.log(`${page.id} is selected`);
          }
          selected = true;
        }
        let ChildDirs = new Array<Page>();
        let ChildFiles = new Array<Page>();
        let Submenu = html``;
        if (sectionContents == undefined) {
          console.warn(`selectionContents is undefined`);
          return;
        } else {
          ChildDirs = this.findChildDirectories(
            TopSection,
            page.route,
            sectionContents,
          );
          ChildFiles = this.findChildFiles(
            TopSection,
            page.route,
            sectionContents,
          );
          if (ChildDirs.length > 0 || ChildFiles.length > 0) {
            if (DEBUG) {
              console.log(`${page.id} is a parent`);
            }
            isParent = true;
          }
          const SubMenuTemplates = new Array<TemplateResult>();

          if(ChildDirs.length > 0) {
            ChildDirs.map((child) => {
              if (child.route.localeCompare(page.route)) {
                if(DEBUG) {
                  console.log(
                    `rendering ${page.route}, child Directory is ${child.route}`,
                  );
                }
                const childTemplate = this.renderSingleEntry(
                  TopSection,
                  sectionContents,
                  child,
                  depth + 1,
                  true,
                );
                if (childTemplate) {
                   SubMenuTemplates.push(...childTemplate);
                }
              }
            })
          }

          if(selected && directory && ChildFiles.length > 0) {
            ChildFiles.map((child) => {
              if (child.route.localeCompare(page.route)) {
                if(DEBUG) {
                  console.log(
                    `rendering ${page.route}, child File is ${child.route}`,
                  );
                }
                const childTemplate = this.renderSingleEntry(
                  TopSection,
                  sectionContents,
                  child,
                  depth,
                  false
                );
                if (childTemplate) {
                  SubMenuTemplates.push(...childTemplate);
                }
              }
            })
          }

          if (directory && (ChildDirs.length > 0 || ChildFiles.length > 0)) {
            Submenu = html`
              <ul class="spectrum-SideNav">
                ${SubMenuTemplates}
              </ul>
            `;
          }
        }

        returnableTemplates.push(html`
          <li class="spectrum-SideNav-item" ?is-selected=${selected}>
            <a href="${page.route}" class="spectrum-SideNav-itemLink">
              <iconify-icon
                icon=${directory ? "lsicon:folder-filled" : "ep:document"}
                class="spectrum-Icon spectrum-Icon--sizeM"
                focusable="false"
                aria-hidden="true"
              ></iconify-icon>
              <span class="spectrum-SideNav-link-text">${page.title}</span>
            </a>
            ${Submenu}
          </li>
        `);
        if(DEBUG){
          console.log(
            `returnableTemplates has ${returnableTemplates.length} templates`,
          );
        }
      } else {
        if(DEBUG) {
          if(depth >= 2) {
            console.log(`depth is ${depth}, not rendering ${page.route} for route ${this.route}`)
          }
        }
      }
    }
    return returnableTemplates;
  }

  private async getTopLevels(): Promise<TemplateResult[]> {
    const templates = new Array<TemplateResult>();

    const TopSection = this.currentTopLevel();
    if (TopSection == null) {
      console.warn(`unable to find TopSection in getTopLevels`);
    } else {
      if (DEBUG) {
        console.log(`TopSection is ${TopSection}`);
      }
      await Promise.all(
        TopLevelSections.options
          .sort((a, b) => {
            return a.replace(" ", "").localeCompare(b.replace(" ", ""));
          })
          .map(async (tls) => {
            if (DEBUG) {
              console.log(`SpectrumSideNav getTopLevels tls is ${tls}`);
            }
            const tlsAsRoute = `/${tls.replace(" ", "")}/`;
            if (DEBUG) {
              console.log(`searching for page matching ${tlsAsRoute}`);
            }
            let tlsPage = await getContentByRoute(tlsAsRoute);
            if (Array.isArray(tlsPage)) {
              tlsPage = tlsPage.find((page: Page) => {
                return !page.route.localeCompare(tlsAsRoute);
              });
            }
            if (tlsPage != undefined && tlsPage != null) {
              if (DEBUG) {
                console.log(`found page ${JSON.stringify(tlsPage)}`);
              }
              const sectionContents = await getContentByCollection(tls);
              const tlsEntry = this.renderSingleEntry(
                TopSection,
                sectionContents,
                tlsPage,
              );
              if (tlsEntry) {
                templates.push(...tlsEntry);
              }
            } else {
              console.warn(`cannot find TLS page for ${tlsAsRoute}`);
            }
          }),
      );
    }

    return templates;
  }

  static localStyle = css`

    nav {
      margin-left: -1.5rem;
    }
    .spectrum-SideNav-item {
      margin-left: 1rem;
    }
  `;

  static styles = [SpectrumSideNav, SideNav.localStyle];

  protected render() {
    if (DEBUG) {
      console.log(`SpectrumSideNav render start`);
      console.log(`route is ${this.route}`);
    }
    if (
      this.route == undefined ||
      this.route.length == 0 ||
      !this.route.localeCompare("/")
    ) {
      return html`<div>no route</div>`;
    } else {
      const topSections = this.getTopLevels();

      return html`
        <nav>
          <ul class="spectrum-SideNav spectrum-SideNav--multiLevel">
            ${until(topSections, "waiting for data")}
          </ul>
        </nav>
      `;
    }
  }
}
