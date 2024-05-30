# `<tab-trap>`

Tab trap is a custom element/web component that traps tab presses. It weighs 0.7KB when minified and compressed with brotli. It is written in vanilla JavaScript and has no dependencies.

It differs from many other focus trap libraries in that it offers a declarative API via HTML. This makes it easy to understand, since there is practically no API to learn. It also means it is usable with all frameworks and libraries with little effort.

Another important detail is that it understands the shadow DOM and will take elements nested in shadow roots into account when calculating the trap boundaries. This is important for use in, or alongside, other web components.

Finally, it aims to be as lightweight and fast as possible. Many other focus trap libraries traverse the entire sub-tree, collecting all tabbable elements. Others find both the first and last tabbable elements. `<tab-trap>` only has to find the _first_ tabbable element. Additionally, we skip entire subtrees where possible, further speeding up the search. Unless browsers offer a native API for traversing by tab order, this is likely the optimal approach.

## Installation

```bash
npm install tab-trap
```

## Usage

### Via module

```js
import "tab-trap";
```

### Via CDN

```html
<script type="module" src="https://unpkg.com/tab-trap"></script>
```

### Using the component

```html
<tab-trap>
  <button>Button 1</button>
  <button>Button 2</button>
  <button>Button 3</button>
</tab-trap>
<button>Button 4</button>
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

## Docs

For full documentation, visit: https://wicky.nillia.ms/tab-trap/

## License

MIT
