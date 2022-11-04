// some elements are only focusable when they have specific attributes
/** @type {Record<string, string>} */ const edgeCases = {
  a: "href",
  audio: "controls",
  video: "controls",
};

/**
 * @param {Element} node
 * @param {TabTrap} trap
 * @param {Set<string>} radios tracks seen radio groups
 * @returns {HTMLElement | undefined}
 */
function firstTabbableElement(node, trap, radios = new Set()) {
  // we can skip the entire subtree in some circumstances
  if (
    // disabled fieldset
    (node instanceof HTMLFieldSetElement && node.hasAttribute(DISABLED)) ||
    // inert element
    node.hasAttribute("inert") ||
    // hidden element
    node.hasAttribute("hidden")
  ) {
    return;
  }

  // if we encounter an unchecked named radio, then do a sort of lookahead
  // to find if any radios in the name group are checked.
  // we track which name groups we have seen to minimize repeated work
  if (
    node instanceof HTMLInputElement &&
    node.type === "radio" &&
    node.name &&
    !node.checked &&
    !radios.has(node.name)
  ) {
    radios.add(node.name);
    node = trap.querySelector(`[name="${node.name}"][checked]`) ?? node;
  }

  if (node instanceof HTMLElement && trap.isTabbable(node)) {
    return node;
  }

  let children =
    node.shadowRoot?.children ||
    (node instanceof HTMLSlotElement
      ? node.assignedElements({ flatten: true })
      : node.children);

  for (let child of children) {
    const found = firstTabbableElement(child, trap, radios);
    if (found) {
      return found;
    }
  }
}

/**
 *
 * @param {Record<string, any>} obj
 * @param {string} key
 */
function upgrade(obj, key) {
  if (obj.hasOwnProperty(key)) {
    const value = obj[key];
    delete obj[key];
    obj[key] = value;
  }
}

const KEYDOWN = "keydown";
const FOCUS = "focus";
const DISABLED = "disabled";
const template = `<slot></slot><div tabindex="0" aria-hidden="true"></div>`;

export class TabTrap extends HTMLElement {
  #guard;
  #slot;
  #isWrapping = false;

  static observedAttributes = [DISABLED];

  /**
   * @param {string} name
   * @param {string | null} oldValue
   * @param {string | null} newValue
   * @internal
   */
  attributeChangedCallback(name, oldValue, newValue) {
    this.#guard.tabIndex = newValue !== null ? -1 : 0;
  }

  get disabled() {
    return this.hasAttribute(DISABLED);
  }

  set disabled(disabled) {
    this.toggleAttribute(DISABLED, disabled);
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = template;
    this.#slot = shadow.children[0];
    this.#guard = /** @type {HTMLElement} */ (shadow.children[1]);
  }

  /**
   * @internal
   */
  connectedCallback() {
    upgrade(this, DISABLED);
    this.addEventListener(KEYDOWN, this);
    this.#guard.addEventListener(FOCUS, this);
  }

  /**
   * @param {Event} e
   * @internal
   */
  handleEvent(e) {
    if (this[DISABLED]) {
      return;
    }

    if (
      e.type === KEYDOWN &&
      /** @type {KeyboardEvent} */ (e).shiftKey &&
      /** @type {KeyboardEvent} */ (e).key === "Tab" &&
      e.target === this.firstTabbableElement()
    ) {
      this.#isWrapping = true;
      this.#guard.focus();
      this.#isWrapping = false;
    }

    if (e.type === FOCUS && !this.#isWrapping) {
      this.focus();
    }
  }

  firstTabbableElement() {
    return firstTabbableElement(this.#slot, this);
  }

  /**
   *
   * @param {FocusOptions} [options]
   */
  focus(options) {
    this.firstTabbableElement()?.focus(options);
  }

  /**
   * Determines whether an element is tabbable.
   * This can be overridden if you want to provide more complex/complete logic
   * @param {HTMLElement} node
   * @returns {boolean}
   */
  isTabbable(node) {
    if (node.contentEditable === "true") {
      return true;
    }

    if (node.tabIndex < 0 || node.hasAttribute(DISABLED)) {
      return false;
    }

    // TODO: replace with `visibilityProperty` eventually
    if (!node.checkVisibility({ checkVisibilityCSS: true })) {
      return false;
    }

    const attr = edgeCases[node.localName];
    return attr ? node.hasAttribute(attr) : true;
  }
}

customElements.define("tab-trap", TabTrap);
