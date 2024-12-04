export const prerender = false;
import { LitElement, html, css, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";

//@ts-expect-error
import SpectrumSplitView from "@spectrum-css/splitview" with { type: "css" };

const DEBUG = 0;

@customElement("split-view")
export default class SplitView extends LitElement {
  @property({ type: String, reflect: true })
  public route: string = "";

  grabbed(grabber?: Element) {
    if (DEBUG) {
      console.log(`grabbed called`);
    }
    this.mouse_is_down = false;
    if (grabber !== undefined) {
      if (DEBUG) {
        console.log(`grabbed has grabber`);
      }
      grabber.addEventListener("mousedown", (e) => {
        if (DEBUG) {
          console.log(`setting mouse_is_down true`);
        }
        this.mouse_is_down = true;
      });
    }

    document.addEventListener("mousemove", (e) => {
      if (!this.mouse_is_down) {
        return;
      }
      if (DEBUG) {
        console.log(`setting width to ${e.clientX}`);
      }
      this.dynamicStyles.width = `${e.clientX}px`;
      this.requestUpdate("dynamicStyles");
    });

    document.addEventListener("mouseup", () => {
      this.mouse_is_down = false;
    });
  }
  @state()
  private mouse_is_down = false;

  @state()
  private dynamicStyles = { width: "2fr" };

  protected override willUpdate(_changedProperties: PropertyValues): void {
    super.willUpdate(_changedProperties);
    if (DEBUG) {
      console.log(
        `SplitView willUpdate ${Object.keys(_changedProperties).join(" ")}`,
      );
    }
  }

  static localStyle = css`
    .spectrum-SplitView.spectrum-SplitView--horizontal {
      height: minmax(200px, max-content);
    }
    #left.spectrum-SplitView-pane {
      overflow-x: auto;
      min-height: 200px;
    }

    #right.spectrum-SplitView-pane {
      flex: 1;
    }
    .spectrum-SplitView-splitter.is-draggable {
      cursor: col-resize;
      height: 200px;
    }
  `;

  static styles = [SpectrumSplitView, SplitView.localStyle];

  public render() {
    return html`
      <div class="spectrum-SplitView spectrum-SplitView--horizontal">
        <div
          id="left"
          class="spectrum-SplitView-pane"
          style=${styleMap(this.dynamicStyles)}
        >
          <slot name="left"></slot>
        </div>
        <div
          class="spectrum-SplitView-splitter is-draggable"
          ${ref(this.grabbed)}
        ></div>
        <div id="right" class="spectrum-SplitView-pane" style="flex: 1">
          <slot name="right"></slot>
        </div>
      </div>
    `;
  }
}
