# ClickTrigger2

_Turn DOM Elements into triggers that initiate action upon clicking them._

---

## Installation

```shell
> npm i @gebruederheitz/clicktrigger2
```

## Usage

Clicktrigger2 is a  utility to easily attach mouse click listeners and events 
to DOM elements using classnames, data-attributes or a script config.

`Factory` serves more or less as an abstract class for the different
configuration method-dependent Factories.

`ClickTrigger` acts as a very simple interface to the DOM click event via the
trigger HTML element, whose class assignment it also handles.

`Target` is more or less the main controlling element, subscribing to both
its trigger(s) and group and broadcasting any state changes to any
interested parties.

`Group` acts as a simple interface to collect and forward events from all
Targets that subscribe to it. Additionally, it keeps track on whether there's
an element currently open.

```js
import { FactoryDOMConfig, FactoryDataAttributeConfig } from '@gebruederheitz/clicktrigger2';
```

Or use the UMD bundle directly:
```html
<script src="/path/to/node_modules/@gebruederheitz/clicktrigger2/dist/bundle.js"></script>
<script>
    const factory = ghct.FactoryDOMConfig;
</script>
```

Or use the autoloading bundle that initializes the appropriate factory as soon
as the DOM is ready:
```html
<script src="/path/to/node_modules/@gebruederheitz/clicktrigger2/dist/auto-bundle.js"></script>
```

### Styling

You may use and extend the default styles provided by this package in your 
(S)CSS:
```sass
// Your frontend SASS file

// Import the stylesheet
@use 'node_modules/@gebruederheitz/clicktrigger2/scss/clicktrigger2' with (
  $variable: 'value',
);
```


Or use the precompiled CSS file:
```html
<link 
  rel="stylesheet"
  href="/path/to/node_modules/@gebruederheitz/clicktrigger2/dist/clicktrigger2.css"
/>
```


## Development

You can use the watch task:
```shell
$> npm run watch
# or
make
# or, more explicitly
make dev
```

After making your changes, run
```bash
npm run build
# or
make build
```
to create the ES5 build at `dist/bundle.js`, the auto-init bundle at 
`dist/auto-bundle.js` and the ES-module build at `dist/index.mjs`.
Bump the version number in `package.json` (or use `yarn publish`).
