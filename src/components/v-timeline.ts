import { DateTime } from "luxon";
import { Event, DisplayableEvent } from "../lib/TimelineTypes.ts";

const DEBUG = true;

export default class VerticalTimeline extends HTMLElement {
  public events: string = "";
  private _events: DisplayableEvent[] = new Array<DisplayableEvent>();

  private getEvents() {
    const _changedProperties = this.getAttributeNames();
    if (_changedProperties.includes("events")) {
      this.events = this.getAttribute("events") ?? "";
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

  async connectedCallback() {
    if (DEBUG) {
      console.log(`VerticalTimeline getEvents render`);
    }
    this.getEvents();
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
      this.innerHTML = `
        <link rel="stylesheet" href="../styles/Timeline.css" />
        <section class="timeline">
          <ul class="timeline spectrum-Typography">
            ${this._events.map((event, index) => {
              const date = DateTime.fromJSDate(event.date as Date);
              return `
                <li id="${date.toUnixInteger().toString()}">
                  <h5 class=" spectrum-Heading spectrum-Heading--sizeM">
                    ${date.toISODate()}
                  </h5>
                  <div class="${event.type} spectrum-Typography">
                    <h6 class=" spectrum-Heading spectrum-Heading--sizeXS">
                      ${event.blurb}
                    </h6>
                    ${event.description ? event.description : ""}
                    ${
                      event.source && event.source !== ""
                        ? `
                      <a href="#${date.toUnixInteger()}-${index}"
                        >Sources # ${index + 1}</a
                      >
                    `
                        : ""
                    }
                  </div>
                </li>
              `;
            })}
            </li>
          </ul>
        </section>

        <section  class="footnotes">
            <ol class="spectrum-Typography">
                ${this._events.map((entry, index) => {
                  if (entry.source !== "") {
                    const date = DateTime.fromJSDate(entry.date);
                    return `
                      <li>
                        <a name=${`${date.toUnixInteger()}-${index}`}>
                          ${entry.source}
                        </a>
                      </li>
                    `;
                  } else {
                    return "";
                  }
                })}
            </ol>
        </section>
      `;
    } else {
      this.innerHTML = "";
    }
  }
}
customElements.define("vertical-timeline", VerticalTimeline);
