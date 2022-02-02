import scroll from 'scroll';
import page from 'scroll-doc';
import _debounce from 'lodash-es/debounce';
import { LocationTrigger } from './trigger/location-trigger.js';

export class Scroller {
    constructor(defaultBuffer) {
        this.defaultBuffer = defaultBuffer || 0;
        this.lastOpenElement = null;
        this.onTargetChange = this.onTargetChange.bind(this);
        this.page = page();
        this.timeout = null;
        this.debouncedScrollIntoView = _debounce(this.scrollIntoView, 300).bind(
            this
        );
    }

    addTarget(target) {
        target.on('change', this.onTargetChange);
    }

    parseBuffer(buffer) {
        if (typeof buffer == 'number') {
            // topMargin given in pixels
            return buffer;
        } else if (typeof buffer === 'string') {
            // string value in % or vh
            return (parseInt(buffer, 10) / 100) * window.innerHeight;
        }
    }

    parseScrollConfig(config, fromLocationTrigger) {
        let doScroll = true;
        let buffer = 0;

        if (config.breakpoints) {
            // Responsive settings through an object of max-widths
            const currentWindowWidth = window.innerWidth || 0;
            const sortedBreakpoints = Object.keys(config.breakpoints).sort(
                (a, b) => b > a
            );
            for (let breakpoint in sortedBreakpoints) {
                if (currentWindowWidth > breakpoint) {
                    const breakpointConfig = config.breakpoints[breakpoint];
                    if (
                        !breakpointConfig.doScroll ||
                        (breakpointConfig.locationOnly && !fromLocationTrigger)
                    ) {
                        doScroll = false;
                    } else {
                        if (breakpointConfig.locationOnly) {
                        }
                        buffer = this.parseBuffer(breakpointConfig.buffer);
                    }
                    break;
                }
            }
        } else if (config.buffer) {
            buffer = this.parseBuffer(config.buffer);
        }

        return { doScroll, buffer };
    }

    /**
     *
     * @param {TargetChangeEvent} event
     */
    onTargetChange(event) {
        if (!(event.scroll || event.scrollBack)) return;

        const fromLocationTrigger =
            event.originalSource instanceof LocationTrigger;

        if (event.scrollConfig.locationOnly && !fromLocationTrigger) return;

        const src = event.source;
        let element;
        let topMargin;

        if (event.action === 'show' && event.scroll) {
            // this is where we scroll to the target
            this.lastOpenElement = src;
            element = src.getElement();
            const { doScroll, buffer } = this.parseScrollConfig(
                event.scrollConfig,
                fromLocationTrigger
            );
            if (!doScroll) return;
            topMargin = buffer;
        }

        if (
            event.action === 'hide' &&
            src === this.lastOpenElement &&
            src.primaryTrigger
        ) {
            // this triggers a scrollback event
            element = src.getPrimaryTriggerElement();
            topMargin = 0;
        }

        if (element) {
            this.debouncedScrollIntoView(element, topMargin);
        }
    }

    getElementOffsetTop(elem) {
        let offsetTop = 0;
        do {
            if (!isNaN(elem.offsetTop)) {
                offsetTop += elem.offsetTop;
            }
        } while ((elem = elem.offsetParent));
        return offsetTop;
    }

    // Utility, works even within overflowed scrollable containers nested within
    // other scrollable elements
    scrollIntoView(
        element,
        topMargin = 0,
        minPos = 40,
        maxPos = 0.7,
        container = this.page
    ) {
        const offset = this.getElementOffsetTop(element);
        const position = offset - container.scrollTop;
        // If the element somewhere in between minPos and maxPos% on the visible
        // part of the document (within the window) we're fine
        if (position > minPos && position < maxPos * window.innerHeight) return;
        const distanceTarget = offset - topMargin;
        scroll.top(container, distanceTarget);
    }
}
