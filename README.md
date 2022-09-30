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

### Configuration

#### Configuration options

Most configuration options can apply globally (so they only need to be set once)
as well as for single trigger elements (so they can be overridden individually) 
as indicated by the "Availability" column.

| Option              | Availability     | Type          | Default value | Description 
| ------------------- | ---------------- | ------------- | ------------- | ------------
| scroll              | global & element | object        | _see below_   |  
| scroll.doScroll     |                  | boolean       | `false`       | whether to enable scrolling to a trigger's target when it's opened 
| scroll.buffer       |                  | string|number | `''`          | Margins to define when scrolling action will be taken, see examples below
| scroll.scrollBack   |                  | boolean       | `true`        | When enabled, will attempt to scroll so the trigger is near the centre of the viewport when closing the target
| scroll.breakpoints  |                  | object        |               | Allows to configure scrolling for individual breakpoints in responsive views, see below.
| scroll.locationOnly |                  | boolean       | `false`       | When enabled, scrolling will only be performed when triggered by location 
| reposition          | global & element | boolean       | `false`       | Whether to reposition the target element to fit into a row underneath the current row of triggers. In flex-mode this requires a flex-basis in percent to be set on the trigger.
| method              | global & element | string        | `'jQuery'`    | Which method to use for showing/hiding the target. The default uses jQuery's `slideDown()` and `slideUp()`, any other value will leave it to you (or the default stylesheets) to handle CSS animations based on the classnames.
| classes             | global & element | object        | _see below_   | Allows you to customize the classnames given to the various element states
| classes.target.visible   |             | string        | 'gh-ct-visible'       | Any visible target will receive this class
| classes.target.hidden    |             | string        | 'gh-ct-hidden'        | Any non-visible target will receive this class once it's been hidden for the first time
| classes.trigger.active   |             | string        | 'gh-trigger-active'   | Any trigger whose target is visible will receive this class
| classes.trigger.inactive |             | string        | 'gh-trigger-inactive' | Any non-active trigger, i.e. whose target is hidden, has this class from initialization
| classes.trigger.contrast |             | string        | 'gh-trigger-contrast' | Any non-active trigger will receive this class _while another trigger is active_
| type                     | element     | `'toggle'|'hide'|'show'` | `'toggle'` | Allows you to define open-only or close-only triggers (like a "close-cross-icon" inside a target)
| slug                     | element     | string        | _random UUID_         | Define a custom slug which allows triggering the element via a location hash (mysite.com/page#element-slug)
| groupName                | element     | string        | `''`                  | Out of any group a maximum of one element can be open at any time. If a different trigger in the same group is clicked, the previously open element is closed. The contrast class is also based on a trigger's group assignment.
| target                   | element     | DOMSelectorString | `''`              | A selector string identifying the target element. You can use a special "parent of" syntax to beat the cascade if required: `$parent::$parent::#my_element` selects the grandparent of `#my-element`.
| secondary                | element     | boolean       | `false`               | Defines a trigger as a secondary trigger. Only the primary trigger will be considered for scrolling (scrollback) and repositioning calculations. When defining multiple triggers without defining them as secondary, the primary trigger is overwritten.

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

As this tool was originally written to provide a simple interface usable with
a no-code tool such as Webflow, most configuration can be performed without a
single line of JavaScript, using element data attributes for configuration.

```html
<div
    data-triggertype='toggle'
    data-triggertarget='#test1'
    data-triggergroup="gr1"
    data-triggerslug="test1"
>
    Trigger
</div>

<div id="test1">Target</div>
```

You can use the following attributes, some of which are directly equivalent to
their JS configuration counterparts. In general, all settings apply only to the
trigger element they are declared on, the special element with `data-triggerglobals`
being the exception.

| data-attribute      | equivalent config key           | notes 
| ------------------- | ------------------------------- | ----- 
| triggertype         | type                            | has an additional "toggleClass" type, which sets "method" to non-jQuery and uses type "toggle"
| triggertarget       | target                          | The required attribute declaring any element as a trigger.
| triggergroup        | group                           |
| triggerslug         | slug                            |
| triggersecondary    | secondary                       |
| triggerglobals      | _-none-_                        | a special non-trigger element used to declare global settings
| triggerscroll       | scroll.doScroll & scroll.buffer | Do scroll is false when absent, true otherwise. The value defined the scroll buffer.
| triggernoscrollback | scroll.scrollBack               | scrollback is enabled by default and can be unset by setting a value
| triggeractive       | classes.trigger.active          | comma-separated list of classnames to apply to the active trigger element
| triggerinactive     | classes.trigger.inactive        | comma-separated list of classnames to apply to all inactive trigger elements while a trigger is active
| triggerreposition   | reposition                      |
| triggermethod       | method                          |


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

Take a look at [scss/clicktrigger2.scss](scss/clicktrigger2.scss) for a list of 
available overrides.


Or use the precompiled CSS file:
```html
<link
    rel="stylesheet"
    href="/path/to/node_modules/@gebruederheitz/clicktrigger2/dist/clicktrigger2.css"
/>
```



## Development

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
