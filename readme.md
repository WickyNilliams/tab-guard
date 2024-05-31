# `<tab-trap>`

Tab trap is a custom element/web component that traps tab presses.

- **Small** - 0.8KB min/brotli
- **Simple** - practically no API
- **Efficient** - minimal DOM traversal

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
