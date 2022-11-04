# `<tab-trap>`

Tab trap is a custom element/web component that traps tab presses. It weighs 0.7KB when minified and compressed with brotli. It is written in vanilla JavaScript and has no dependencies.

It differs from many other focus trap libraries in that it offers a declarative API via HTML. This makes it easy to understand, since there is practically no API to learn. It also means it is usable with all frameworks and libraries with little effort.

Another important detail is that it understands the shadow DOM and will take elements nested in shadow roots into account when calculating the trap boundaries. This is important for use in, or alongside, other web components.

Finally, it aims to be as lightweight and fast as possible. Many other focus trap libraries traverse the entire sub-tree, collecting all tabbable elements. Others find both the first and last tabbable elements. `<tab-trap>` only has to find the _first_ tabbable element. Additionally, we skip entire subtrees where possible, further speeding up the search. Unless browsers offer a native API for traversing by tab order, this is likely the optimal approach.

## Installation

```sh
npm install tab-trap
```

## Usage

```html
<tab-trap>
  <button>Button 1</button>
  <button>Button 2</button>
  <button>Button 3</button>
</tab-trap>
<button>Button 4</button>
```

In the above example, if you tab through the buttons, focus will not be able to leave the trap. If you tab past Button 3, focus will go back to Button 1. If you shift-tab past Button 1, focus will go to Button 3. You will not be able to reach Button 4 via tabbing.

Tab traps can be nested:

```html
<tab-trap>
  <button>Button 1</button>
  <button>Button 2</button>
  <tab-trap>
    <button>Button 3</button>
    <button>Button 4</button>
  </tab-trap>
</tab-trap>
```

Tab traps can be `disabled`:

```html
<tab-trap>
  <button>Button 1</button>
  <button>Button 2</button>
  <tab-trap disabled>
    <button>Button 3</button>
    <button>Button 4</button>
  </tab-trap>
</tab-trap>
```

## Extensibility

Tab trap is a custom element, so it can be extended like any other custom element. This allows you to add custom behavior or styling.

If you wish to tweak the logic for what is considered tabbable, you can override the `isTabbable` method:

```js
import { TabTrap } from "tab-trap";

class MyTabTrap extends TabTrap {
  isTabbable(element) {
    return super.isTabbable(element) && someCustomCheck(element);
  }
}

customElements.define("my-tab-trap", MyTabTrap);
```

## Accessibility

Focus traps are useful for keyboard accessibility. They can be used to trap focus within a modal, for example. This is useful because it prevents users from tabbing out of the modal and getting lost in the rest of the page.

For screen reader support, you need to add `aria-hidden="true"` or `inert` to all other elements in the page. This may be added as a built-in feature in future (PRs welcome!).

## Browser support

Tab trap relies on

- Custom Elements APIs
- Private JS properties

Custom elements have been supported for many years now. Private properties can be transpiled away if you wish.
