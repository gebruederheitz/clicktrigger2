import scroll from 'scroll';
import page from 'scroll-doc';
import _debounce from 'lodash-es/debounce';

class Scroller {
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

    determineScrollBuffer(element, buff) {
        if (!buff) return null;
        const elementPosition = element.offsetTop;
        // 'true' means scroll right to the element
        if (typeof buff == 'boolean') return elementPosition;
        // 'pagetop' means scroll to the top of the page
        if (buff == 'pagetop') return 0;
        // a number is the distance in pixels from the element's top position
        if (typeof buff == 'number') return elementPosition - buff;
        // a string with a number and ending in '%' is basically a 'vh' buffer on top of the element
        if (
            typeof buff == 'string' &&
            typeof buff.endsWith == 'function' &&
            buff.endsWith('%') &&
            !isNaN(parseInt(buff, 10))
        ) {
            buff = parseInt(buff, 10);
            buff /= 100;
            buff = window.innerHeight * buff;
            return elementPosition - buff;
        }
    }

    onTargetChange(event) {
        if (!(event.scroll || event.scrollBack)) return;
        const src = event.originalSource;
        let element;
        if (event.action == 'show' && event.scroll) {
            // this is where we scroll to the target
            this.lastOpenElement = src;
            element = src.getElement();
        }
        if (
            event.action == 'hide' &&
            src == this.lastOpenElement &&
            src.primaryTrigger
        ) {
            // this triggers a scrollback event
            element = src.getPrimaryTriggerElement();
        }
        if (element) {
            this.debouncedScrollIntoView(element, event.scrollBuffer);
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
        // const offset = element.offsetTop;
        const offset = this.getElementOffsetTop(element);
        const position = offset - container.scrollTop;
        // If the element somewhere in between minPos and maxPos% on the visible
        // part of the document (within the window) we're fine
        if (position > minPos && position < maxPos * window.innerHeight) return;
        let distanceTarget;
        // topMargin given in pixels
        if (typeof topMargin == 'number') {
            distanceTarget = offset - topMargin;
            // string value in % or vh
        } else {
            distanceTarget =
                offset - (parseInt(topMargin, 10) / 100) * window.innerHeight;
        }
        scroll.top(container, distanceTarget);
    }

    scrollToElement(element, buffer) {
        buffer = buffer || this.defaultBuffer;
        const targetZone = this.determineScrollBuffer(element, buffer);
        scroll.top(this.page, targetZone);
    }
}

export default Scroller;
