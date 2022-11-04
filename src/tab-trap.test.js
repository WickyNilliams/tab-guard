import {
  expect,
  fixture,
  html,
  defineCE,
  unsafeStatic,
} from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { TabTrap } from "./tab-trap.js";

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

async function tabSequence(count) {
  let result = [];
  for (let i = 0; i < count; i++) {
    await tab();
    result.push(getActiveElement());
  }

  return result;
}

describe("tab-trap", () => {
  it("works", async () => {
    const el = await fixture(html`
      <tab-trap>
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
      </tab-trap>
    `);

    const seq = await tabSequence(4);
    expect(seq).to.have.ordered.members([first, second, third, first]);
  });

  it("handles disabled elements", async () => {
    const el = await fixture(html`
      <tab-trap>
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
      </tab-trap>
    `);

    const seq = await tabSequence(3);
    expect(seq).to.have.ordered.members([first, second, first]);
  });

  it("handles tabbing backwards", async () => {
    let count = 0;

    await fixture(html`
      <tab-trap>
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
      </tab-trap>
    `);

    await tab();
    await shiftTab();
    await shiftTab();

    expect(count).to.eq(2);
  });

  it("can be nested", async () => {
    const el = await fixture(html`
      <tab-trap>
        <button id="outer1">outer 1</button>

        <tab-trap>
          <button id="inner1">inner 1</button>
          <button id="inner2">inner 2</button>
        </tab-trap>

        <button>outer 2</button>
      </tab-trap>
    `);

    const seq = await tabSequence(4);
    expect(seq).to.have.ordered.members([outer1, inner1, inner2, inner1]);
  });

  it("can be disabled", async () => {
    const el = await fixture(html`
      <tab-trap>
        <button id="outer1">outer 1</button>

        <tab-trap disabled>
          <button id="inner1">inner 1</button>
          <button id="inner2">inner 2</button>
        </tab-trap>

        <button id="outer2">outer 2</button>
      </tab-trap>
    `);

    let seq = await tabSequence(4);
    expect(seq).to.have.ordered.members([outer1, inner1, inner2, outer2]);

    const trap = /** @type {TabTrap} */ (el.querySelector("tab-trap tab-trap"));
    trap.disabled = false;

    seq = await tabSequence(4);
    expect(seq).to.have.ordered.members([outer1, inner1, inner2, inner1]);
  });

  it("handles elements in shadow roots", async () => {
    const tagName = defineCE(
      class TestElement extends HTMLElement {
        constructor() {
          super();
          const shadow = this.attachShadow({ mode: "open" });
          shadow.innerHTML = `<button><slot></slot></button>`;
        }
      }
    );
    const tag = unsafeStatic(tagName);

    const el = await fixture(html`
      <tab-trap>
        <${tag} id="ce">in shadow dom</${tag}>
        <button id="btn">button 2</button>
      </tab-trap>

      <button>outer</button>
    `);

    const ce = el.querySelector(`#ce`);
    const btn = el.querySelector(`#btn`);

    const seq = await tabSequence(3);
    expect(seq).to.have.ordered.members([ce, btn, ce]);
  });

  it("handles arbitrary elements with tabindex='0'", async () => {
    const el = await fixture(html`
      <tab-trap>
        <div id="fake" role="button" tabindex="0">fake button</div>
        <button id="real">real button</button>
      </tab-trap>
      <button id="outside">outside</button>
    `);

    const sequence = await tabSequence(3);
    expect(sequence).to.have.ordered.members([fake, real, fake]);
  });

  it("handles disabled fieldsets", async () => {
    const el = await fixture(html`
      <tab-trap>
        <fieldset disabled>
          <legend>Test</legend>
          <input type="text" />
        </fieldset>
        <button id="first">first</button>
        <button id="second">second</button>
      </tab-trap>
      <button>outside</button>
    `);

    const sequence = await tabSequence(3);
    expect(sequence).to.have.ordered.members([first, second, first]);
  });

  it("handles [hidden] elements", async () => {
    const el = await fixture(html`
      <tab-trap>
        <div hidden>
          <button>hidden</button>
        </div>
        <button id="first">first</button>
        <button id="second">second</button>
      </tab-trap>
      <button>outside</button>
    `);

    const sequence = await tabSequence(3);
    expect(sequence).to.have.ordered.members([first, second, first]);
  });

  it("handles non-visible elements", async () => {
    const el = await fixture(html`
      <tab-trap id="what">
        <div style="display:none">
          <button id="error">hidden</button>
        </div>
        <button id="first">first</button>
        <button id="second">second</button>
      </tab-trap>
      <button>outside</button>
    `);

    const sequence = await tabSequence(3);
    expect(sequence).to.have.ordered.members([first, second, first]);
  });

  it("handles contenteditable", async () => {
    const el = await fixture(html`
      <tab-trap>
        <div contenteditable="false">Lorem, ipsum dolor.</div>
        <div contenteditable id="first">Lorem ipsum dolor sit amet.</div>
        <div contenteditable tabindex="-1">Lorem ipsum dolor sit amet.</div>
        <button id="second">second</button>
      </tab-trap>
      <button>outside</button>
    `);

    const sequence = await tabSequence(3);
    expect(sequence).to.have.ordered.members([first, second, first]);
  });

  describe("radios", () => {
    it("focuses first radio if none checked", async () => {
      const el = await fixture(html`
        <tab-trap>
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
        </tab-trap>
        <button>outside</button>
      `);

      const seq = await tabSequence(3);
      expect(seq).to.have.ordered.members([first, second, first]);
    });

    it("focuses first checked radio if one exists", async () => {
      const el = await fixture(html`
        <tab-trap>
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
        </tab-trap>
        <button>outside</button>
      `);

      const seq = await tabSequence(3);
      expect(seq).to.have.ordered.members([first, second, first]);
    });

    it("focuses first non-disabled radio", async () => {
      await fixture(html`
        <tab-trap>
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
        </tab-trap>
        <button>outside</button>
      `);

      const seq = await tabSequence(3);
      expect(seq).to.have.ordered.members([first, second, first]);
    });
  });

  it("can be programmatically focused", async () => {
    /** @type {TabTrap} */
    const trap = await fixture(html`
      <tab-trap>
        <button disabled>disabled</button>
        <button id="expected">enabled</button>
      </tab-trap>
      <button>outside</button>
    `);

    trap.focus();
    expect(getActiveElement()).to.eq(expected);
  });
});
