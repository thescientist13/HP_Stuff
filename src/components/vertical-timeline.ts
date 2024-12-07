import { LitElement, type PropertyValues, html, css } from "lit-element";
import { property, state, customElement } from "lit-element/decorators.js";
import { DateTime } from "luxon";

import { nothing } from "lit";

import { Event, DisplayableEvent } from "../lib/TimelineTypes.ts";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import SpectrumTokens from "@spectrum-css/tokens" with { type: "css" };
import SpectrumTypography from "@spectrum-css/typography" with { type: "css" };

const DEBUG = true;

@customElement("vertical-timeline")
export default class VerticalTimeline extends LitElement {
  @property({ type: String })
  public events: string = "";

  @state()
  private _events: DisplayableEvent[] = new Array<DisplayableEvent>();

  protected willUpdate(_changedProperties: PropertyValues): void {
    super.willUpdate(_changedProperties);

    if (_changedProperties.has("events")) {
      if (DEBUG) {
        console.log(
          `VerticalTimeline willUpdate detected change to this.events ${decodeURIComponent(this.events)}`,
        );
      }
      if (
        this.events !== undefined &&
        this.events !== null &&
        this.events.length > 0
      ) {
        const validate = Event.array().safeParse(
          JSON.parse(decodeURIComponent(this.events)),
        );
        if (validate.success) {
          validate.data.map((event) => {
            this._events.push({
              type: event.type,
              blurb: event.blurb,
              description: event.description,
              source: event.source,
              date: DateTime.fromISO(event.date as string).toJSDate(),
            });
          });
        } else {
          console.error(
            `this.events  is something odd, ${validate.error.message}`,
          );
        }
      }
    }
  }

  static styles = [
    SpectrumTokens,
    SpectrumTypography,
    css`
      li > .magical {
        background-color: var(--spectrum-purple-100);
        > p {
          margin-top: 0px;
        }
      }

      li > .mundane {
        > p {
          margin-top: 0px;
        }
        background-color: var(--spectrum-gray-200);
      }

      li > .mundane.england {
        > p {
          margin-top: 0px;
        }
        background-color: transparent;
        background-image: linear-gradient(
          175deg,
          var(--spectrum-gray-200) 15%,
          var(--spectrum-red-100) 90%
        );
      }

      li > .mundane.scotland {
        > p {
          margin-top: 0px;
        }
        background-color: transparent;
        background-image: linear-gradient(
          175deg,
          var(--spectrum-gray-200) 15%,
          var(--spectrum-blue-100) 90%
        );
      }

      li > .mundane.ireland {
        > p {
          margin-top: 0px;
        }
        background-color: transparent;
        background-image: linear-gradient(
          175deg,
          var(--spectrum-gray-200) 15%,
          var(--spectrum-green-100) 90%
        );
      }

      li > .mundane.gb {
        > p {
          margin-top: 0px;
        }
        background-color: transparent;
        background-image: linear-gradient(
          175deg,
          var(--spectrum-gray-200) 15%,
          var(--spectrum-red-100),
          var(--spectrum-blue-100)
        );
      }

      li > .religious {
        > p {
          margin-top: 0px;
        }
        background-color: var(--spectrum-orange-100);
      }

      ul.timeline {
        list-style-type: none;
        position: relative;
      }

      ul.timeline:before {
        content: " ";
        background: #bebebe;
        display: inline-block;
        position: absolute;
        left: 0.5em;
        width: 0.2em;
        height: 100%;
      }

      ul.timeline > li {
        margin: 0.75em 0;
        padding-left: 0.2em;
      }

      ul.timeline > li:first-child {
        padding-top: 0.03em;
      }

      ul.timeline > li:before {
        content: " ";
        background: white;
        display: inline-block;
        position: absolute;
        border-radius: 50%;
        border: solid 0.2em #bebebe;
        left: 0.1em;
        width: 1em;
        height: 1em;
        margin-top: 0.25em;
      }
    `,
  ];

  protected render() {
    if (DEBUG) {
      console.log(`VerticalTimeline getEvents render`);
    }
    if (Array.isArray(this._events) && this._events.length > 0) {
      this._events.sort((a, b) => {
        if (a.date === null || a.date === undefined) {
          if (b.date === null || b.date === undefined) {
            return 0;
          } else return -1;
        } else if (b.date === null || b.date === undefined) {
          if (a.date === null || a.date === undefined) {
            return 0;
          } else return 1;
        } else if (a.date < b.date) {
          return -1;
        } else if (a.date > b.date) {
          return 1;
        } else {
          return 0;
        }
      });
      return html`
        <ul class="timeline spectrum-Typography">
          ${this._events.map((event, index) => {
            const date = DateTime.fromJSDate(event.date as Date);
            return html`
              <li id="${date.toUnixInteger().toString()}">
                <h5 class=" spectrum-Heading spectrum-Heading--sizeM">
                  ${date.toISODate()}
                </h5>
                <div class="${event.type} spectrum-Typography">
                  <h6 class=" spectrum-Heading spectrum-Heading--sizeXS">
                    ${event.blurb}
                  </h6>
                  ${event.description && unsafeHTML(event.description)}
                  ${event.source &&
                  event.source !== "" &&
                  html`
                    <a href="#${(event.date! as Date).toString()}-${index}"
                      >Sources</a
                    >
                  `}
                </div>
              </li>
            `;
          })}
          </li>
        </ul>
      `;
    } else {
      return nothing;
    }
  }
}
