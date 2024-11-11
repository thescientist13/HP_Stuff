import { LitElement, html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";

import { z } from "zod";

import {
  type Quality,
  type DatevalType,
  type EventType,
  type Role,
  type RelType,
  type Gender,
  type Derivation,
  type NameType,
  type RepositoryType,
  type UrlType,
  type Medium,
  type Xml,
  type Tag,
  type Tags,
  type Sourceref,
  type ReporefElement,
  type Source,
  type Sources,
  type Url,
  type Repository,
  type Repositories,
  type Pname,
  type Coord,
  type Placeobj,
  type Places,
  type Personref,
  type SurnameClass,
  type NameElement,
  type Address,
  type EventrefElement,
  type Person,
  type People,
  type Note,
  type Notes,
  type Researcher,
  type Created,
  type Header,
  type Rel,
  type PurpleChildref,
  type ChildrefElement,
  type Family,
  type Families,
  type EventDateval,
  type Datestr,
  type DaterangeClass,
  type Attribute,
  type Event,
  type Events,
  type CitationDateval,
  type Citation,
  type Citations,
  type Database,
  type Export,
} from "@lib/GrampsZodTypes";

import { zodData } from "../state";
import { IndividualName } from "../individualName";
import { GrampsEvent } from "../events";
import { SimpleIndividual } from "../simpleIndividual";

import { TailwindMixin } from "../../tailwind.element";

import style from "../../../styles/AncestorsTreeChart.css?inline";

export class AncestorsTreeChart extends TailwindMixin(LitElement, style) {
  @property({ type: String })
  public grampsId: string;

  @property({ type: Number })
  public maxDepth: number;

  @state()
  individual: Person | null | undefined;

  constructor() {
    super();

    this.grampsId = "";
    this.maxDepth = 3;
    this.individual = null;
  }

  private renderTreeLi(
    individual: Person | undefined,
    maxDepth: number,
    isRoot: boolean = false,
  ): TemplateResult<1> | null {
    if (individual && zodData) {
      const db = zodData.get();
      if (db) {
        const family = db.families.family
          .filter((f) => {
            if (individual.childof) {
              const handle = f.handle;
              const iHandle = [individual.childof].flat().shift()?.hlink;
              if (iHandle) {
                return !iHandle.localeCompare(handle);
              }
            }
            return false;
          })
          .shift();
        let child: TemplateResult<1> | null = null;
        if (family) {
          const husbandRef = family.father?.hlink;
          const husband = db.people.person
            .filter((p) => {
              if (p.handle && husbandRef) {
                return !p.handle.localeCompare(husbandRef);
              }
              return false;
            })
            .shift();
          const wifeRef = family.mother?.hlink;
          const wife = db.people.person
            .filter((p) => {
              if (p.handle && wifeRef) {
                return !p.handle.localeCompare(wifeRef);
              }
              return false;
            })
            .shift();
          const currentDepth = maxDepth - 1;
          child = html`
            <ul>
              ${this.renderTreeLi(husband, currentDepth, false)}
              ${this.renderTreeLi(wife, currentDepth, false)}
            </ul>
          `;
        }
        return html`
          <li>
            ${child}
            <span>
              <individual-name
                grampsId=${individual.id}
                link=${isRoot ? nothing : true}
              />
            </span>
          </li>
        `;
      }
    }
    return null;
  }

  public render() {
    console.log(`render; start`);
    if (this.grampsId) {
      if (zodData) {
        const db = zodData.get();
        if (db) {
          this.individual = db.people.person
            .filter((p) => {
              return !p.id.localeCompare(this.grampsId);
            })
            .shift();
          if (this.individual) {
            return html`
              <ul class="ascending-tree">
                ${this.renderTreeLi(this.individual, this.maxDepth, true)}
              </ul>
            `;
          }
        }
      }
    }
    return html``;
  }
}
customElements.define("ancestorstree-chart", AncestorsTreeChart);

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
  grampsId: z.string(),
  maxDepth: z.number().default(3).optional(),
});

export type AncestorsTreeChartProps = z.infer<typeof ancestorsTreeChartProps>;
