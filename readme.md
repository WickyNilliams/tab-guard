# `<tab-guard>`

Tab guard is a custom element/web component that traps tab presses.

- **Small** - 0.8KB min/brotli
- **Simple** - practically no API
- **Efficient** - minimal DOM traversal

## Installation

```bash
npm install tab-guard
```

## Usage

### Via module

```js
import "tab-guard";
```

### Via CDN

```html
<script type="module" src="https://unpkg.com/tab-guard"></script>
```

### Using the component

```html
<tab-guard>
  <button>Button 1</button>
  <button>Button 2</button>
  <button>Button 3</button>
</tab-guard>
<button>Button 4</button>
```

Traps can be `disabled`:

```html
<tab-guard>
  <button>Button 1</button>
  <button>Button 2</button>
  <tab-guard disabled>
    <button>Button 3</button>
    <button>Button 4</button>
  </tab-guard>
</tab-guard>
```

Traps can be nested:

```html
<tab-guard>
  <button>Button 1</button>
  <button>Button 2</button>
  <tab-guard>
    <button>Button 3</button>
    <button>Button 4</button>
  </tab-guard>
</tab-guard>
```

## Docs

For full documentation, visit: https://wicky.nillia.ms/tab-guard/

## License

MIT
