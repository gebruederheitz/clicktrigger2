# ClickTrigger2

_Turn DOM Elements into triggers that initiate action upon clicking them._

---

## Installation

```shell
> npm i @gebruederheitz/clicktrigger2
```

## Usage

Clicktrigger2 is a utility to easily attach mouse click listeners and events
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


### Configuration

#### Using a global DOM object

##### Scrolling

You can define breakpoints to customise scrolling behaviour for different screen
sizes:

```js
let config = {
    // ...
    scroll: {
        doScroll: true,
        breakpoints: {
            0: {
                doScroll: true,
                buffer: 50,
            },
            756: {
                doScroll: false,
            },
            1200: {
                doScroll: true,
                buffer: '100vh',
            },
        },
    },
};
```

This configuration will
- scroll 100vh on screens wider than 1200px,
- _not_ scroll on screens between 756px and 1200px,
- and scroll 50px for any screen narrower than that.

You can also apply scrolling _only_ when the target is being triggered by a
`LocationTrigger`, i.e. in response to a navigation or hashchange event, but not
when targeted by a `ClickTrigger`, i.e. a mouse click / tap.

```js
let config = {
    // ...
    scroll: {
        doScroll: true,
        locationOnly: true,
        buffer: 50,
    },
};

// Can also be used with breakpoints:
config = {
    scroll: {
        doScroll: true,
        breakpoints: {
            0: {
                doScroll: true,
                locationOnly: true,
                buffer: 50,
            },
            756: {
                doScroll: false,
            },
            1200: {
                doScroll: true,
                buffer: '100vh',
            },
        },
    },
};
```

#### Using data attributes


## Development

### Dependencies

- nodeJS LTS (16.x)
- nice to have:
    - GNU make or drop-in alternative
    - NVM

### Quickstart

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
`dist/auto-bundle.js` and the ES-module build at `dist/index.mjs` and make 
certain everything runs smoothly. You should also run `make lint` at least once
to avoid simple linting issues.

When you're finished, you can use `make release` on the main branch to publish
your changes.
