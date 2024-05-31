import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { TabGuard } from "./tab-guard.js";

async function tab() {
  await sendKeys({ press: "Tab" });
}

async function shiftTab() {
  await sendKeys({ down: "Shift" });
  await tab();
  await sendKeys({ up: "Shift" });
}

/**
 *
 * @param {Document | ShadowRoot} root
 */
function getActiveElement(root = document) {
  let active = root.activeElement;

  if (active?.shadowRoot) {
    getActiveElement(active.shadowRoot);
  }

  return active;
}

/**
 *
 * @param {number} count
 * @param {"backward" | "forward"} direction
 * @returns
 */
async function tabSequence(count, direction = "forward") {
  let result = [];
  for (let i = 0; i < count; i++) {
    direction === "forward" ? await tab() : await shiftTab();
    result.push(getActiveElement());
  }

  return result;
}

customElements.define(
  "test-fixture",
  class TestFixture extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `<button><slot></slot></button>`;
    }
  }
);

describe("tab-guard", () => {
  it("works", async () => {
    const el = await fixture(html`
      <tab-guard>
        <div>hello</div>
        <button id="first">hello world</button>
        <input id="second" name="text" />

        <fieldset>
          <label>
            <input id="third" type="radio" name="radio" />
            radio 1
          </label>
          <label>
            <input type="radio" name="radio" />
            radio 2
          </label>
          <label>
            <input type="radio" name="radio" />
            radio 3
          </label>
        </fieldset>
      </tab-guard>
    `);

    const seq = await tabSequence(4);
    expect(seq).to.have.ordered.members([first, second, third, first]);
  });

  it("handles disabled elements", async () => {
    await fixture(html`
      <tab-guard>
        <div>hello</div>
        <button disabled>hello world</button>
        <input id="first" />
        <input id="second" type="text" />

        <fieldset>
          <label>
            <input type="radio" disabled name="radio" />
            radio 1
          </label>
          <label>
            <input type="radio" disabled name="radio" />
            radio 2
          </label>
          <label>
            <input type="radio" disabled name="radio" />
            radio 3
          </label>
        </fieldset>

        <button disabled>test</button>
      </tab-guard>
    `);

    const seq = await tabSequence(3);
    expect(seq).to.have.ordered.members([first, second, first]);
  });

  it("handles tabbing backwards", async () => {
    let count = 0;

    await fixture(html`
      <tab-guard>
        <div>hello</div>
        <button disabled>hello world</button>
        <input @focus=${() => count++} />
        <input type="text" />

        <fieldset>
          <label for="">
            <input type="radio" disabled name="radio" />
            radio 1
          </label>
          <label for="">
            <input type="radio" disabled name="radio" />
            radio 2
          </label>
          <label for="">
            <input type="radio" disabled name="radio" />
            radio 3
          </label>
        </fieldset>

        <button disabled>test</button>
      </tab-guard>
    `);

    await tab();
    await shiftTab();
    await shiftTab();

    expect(count).to.eq(2);
  });

  it("can be nested", async () => {
    const el = await fixture(html`
      <tab-guard>
        <button id="outer1">outer 1</button>

        <tab-guard>
          <button id="inner1">inner 1</button>
          <button id="inner2">inner 2</button>
        </tab-guard>

        <button>outer 2</button>
      </tab-guard>
    `);

    const seq = await tabSequence(4);
    expect(seq).to.have.ordered.members([outer1, inner1, inner2, inner1]);
  });

  it("can be disabled", async () => {
    const el = await fixture(html`
      <tab-guard>
        <button id="outer1">outer 1</button>

        <tab-guard disabled>
          <button id="inner1">inner 1</button>
          <button id="inner2">inner 2</button>
        </tab-guard>

        <button id="outer2">outer 2</button>
      </tab-guard>
    `);

    let seq = await tabSequence(4);
    expect(seq).to.have.ordered.members([outer1, inner1, inner2, outer2]);

    const trap = /** @type {TabGuard} */ (
      el.querySelector("tab-guard tab-guard")
    );
    trap.disabled = false;

    seq = await tabSequence(4);
    expect(seq).to.have.ordered.members([outer1, inner1, inner2, inner1]);
  });

  it("handles elements in shadow roots", async () => {
    await fixture(html`
      <tab-guard>
        <test-fixture id="ce">in shadow dom</test-fixture>
        <button id="btn">button 2</button>
      </tab-guard>

      <button>outer</button>
    `);

    const seq = await tabSequence(3);
    expect(seq).to.have.ordered.members([ce, btn, ce]);
  });

  it("handles elements in shadow roots for shift+tab", async () => {
    await fixture(html`
      <button id="outer">outer</button>
      <tab-guard>
        <test-fixture id="ce">in shadow dom</test-fixture>
        <button id="btn">button 2</button>
      </tab-guard>
    `);

    const forwards = await tabSequence(3);
    expect(forwards).to.have.ordered.members([outer, ce, btn]);

    const backwards = await tabSequence(2, "backward");
    expect(backwards).to.have.ordered.members([ce, btn]);
  });

  it("handles arbitrary elements with tabindex='0'", async () => {
    const el = await fixture(html`
      <tab-guard>
        <div id="fake" role="button" tabindex="0">fake button</div>
        <button id="real">real button</button>
      </tab-guard>
      <button id="outside">outside</button>
    `);

    const sequence = await tabSequence(3);
    expect(sequence).to.have.ordered.members([fake, real, fake]);
  });

  it("handles disabled fieldsets", async () => {
    const el = await fixture(html`
      <tab-guard>
        <fieldset disabled>
          <legend>Test</legend>
          <input type="text" />
        </fieldset>
        <button id="first">first</button>
        <button id="second">second</button>
      </tab-guard>
      <button>outside</button>
    `);

    const sequence = await tabSequence(3);
    expect(sequence).to.have.ordered.members([first, second, first]);
  });

  it("handles [hidden] elements", async () => {
    const el = await fixture(html`
      <tab-guard>
        <div hidden>
          <button>hidden</button>
        </div>
        <button id="first">first</button>
        <button id="second">second</button>
      </tab-guard>
      <button>outside</button>
    `);

    const sequence = await tabSequence(3);
    expect(sequence).to.have.ordered.members([first, second, first]);
  });

  it("handles non-visible elements", async () => {
    const el = await fixture(html`
      <tab-guard id="what">
        <div style="display:none">
          <button id="error">hidden</button>
        </div>
        <button id="first">first</button>
        <button id="second">second</button>
      </tab-guard>
      <button>outside</button>
    `);

    const sequence = await tabSequence(3);
    expect(sequence).to.have.ordered.members([first, second, first]);
  });

  it("handles contenteditable", async () => {
    const el = await fixture(html`
      <tab-guard>
        <div contenteditable="false">Lorem, ipsum dolor.</div>
        <div contenteditable id="first">Lorem ipsum dolor sit amet.</div>
        <div contenteditable tabindex="-1">Lorem ipsum dolor sit amet.</div>
        <button id="second">second</button>
      </tab-guard>
      <button>outside</button>
    `);

    const sequence = await tabSequence(3);
    expect(sequence).to.have.ordered.members([first, second, first]);
  });

  describe("radios", () => {
    it("focuses first radio if none checked", async () => {
      const el = await fixture(html`
        <tab-guard>
          <label>
            Radio 1
            <input name="test" type="radio" id="first" />
          </label>
          <label>
            Radio 2
            <input name="test" type="radio" />
          </label>
          <label>
            Radio 3
            <input name="test" type="radio" />
          </label>
          <button id="second">second</button>
        </tab-guard>
        <button>outside</button>
      `);

      const seq = await tabSequence(3);
      expect(seq).to.have.ordered.members([first, second, first]);
    });

    it("focuses first checked radio if one exists", async () => {
      const el = await fixture(html`
        <tab-guard>
          <label>
            Radio 1
            <input name="test" type="radio" />
          </label>
          <label>
            Radio 2
            <input name="test" type="radio" id="first" checked />
          </label>
          <label>
            Radio 3
            <input name="test" type="radio" />
          </label>
          <button id="second">second</button>
        </tab-guard>
        <button>outside</button>
      `);

      const seq = await tabSequence(3);
      expect(seq).to.have.ordered.members([first, second, first]);
    });

    it("focuses first non-disabled radio", async () => {
      await fixture(html`
        <tab-guard>
          <label>
            Radio 1
            <input name="test" type="radio" disabled />
          </label>
          <label>
            Radio 2
            <input name="test" type="radio" id="first" />
          </label>
          <label>
            Radio 3
            <input name="test" type="radio" />
          </label>
          <button id="second">second</button>
        </tab-guard>
        <button>outside</button>
      `);

      const seq = await tabSequence(3);
      expect(seq).to.have.ordered.members([first, second, first]);
    });
  });

  it("can be programmatically focused", async () => {
    /** @type {TabGuard} */
    const trap = await fixture(html`
      <tab-guard>
        <button disabled>disabled</button>
        <button id="expected">enabled</button>
      </tab-guard>
      <button>outside</button>
    `);

    trap.focus();
    expect(getActiveElement()).to.eq(expected);
  });
});
