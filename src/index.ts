export
const MESSAGE_TYPE_ID = 'iframe-dnd-shim';

function getOffset(baseEl: Element) {
    let el: any = baseEl;
    let x = 0;
    let y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        x += el.offsetLeft - el.scrollLeft;
        y += el.offsetTop - el.scrollTop;
        el = el.parentNode;
    }
    return {top: y, left: x};
}

function postFrameMsg(e: DragEvent, domain: string = '*') {
    const frame = e.target as HTMLIFrameElement;
    const frameOffset = getOffset(frame);
    frame.contentWindow.postMessage({
        clientX: e.clientX - frameOffset.left,
        clientY: e.clientY - frameOffset.top,
        messageType: MESSAGE_TYPE_ID,
        offsetX: e.offsetX,
        offsetY: e.offsetY,
        pageX: e.pageX - frameOffset.left,
        pageY: e.pageY - frameOffset.top,
        screenX: e.screenX,
        screenY: e.screenY,
        timeStamp: e.timeStamp,
        type: e.type
    }, domain);
}

export
interface IEncodeDragEventsOptions {
    domain?: string;
    injectDecodeFunction?: boolean;
}

export
const defaultOptions: IEncodeDragEventsOptions = {
    domain: '*',
    injectDecodeFunction: true
}

/**
 * Attach drag events to the iframe and pass them to the iframe as a messages.
 * if possible, inject decode function to the window of that iframe so the messages are automatically decoded and transformed to the DragEvents
 * @param frame HTMLIFrameElement
 * @param customOptions Object
 */
export
function encodeDragEvents(frame: HTMLIFrameElement, customOptions: IEncodeDragEventsOptions = {}) {
    if (!(frame instanceof HTMLIFrameElement)) {
        throw new Error('Provided element is not an iframe');
    }

    const options = {
        ...defaultOptions,
        ...customOptions
    };
    const getListener = (preventDefault: boolean) => {
        return (e: DragEvent) => {
            if (preventDefault) {
                e.preventDefault();
            }
            postFrameMsg(e, options.domain);
        }
    }

    frame.addEventListener('dragenter', getListener(true), false);
    frame.addEventListener('dragover', getListener(true), false);
    frame.addEventListener('dragleave', getListener(false), false);
    frame.addEventListener('drop', getListener(false), false);

    try {
        if (options.injectDecodeFunction && frame.contentWindow && frame.contentWindow.document) {
            decodeDragEvents(frame.contentWindow);
        }
    }
    catch (exception) {
        // can't assign because of cross domain restrictions
    }
}

let __lastElement: Element | null = null;

function handleDnDMessage(windowObject: any, event: MessageEvent) {
    var element = windowObject.document.elementFromPoint(event.data.offsetX, event.data.offsetY);

    var eventData = event.data;
    eventData.bubbles = true;
    eventData.cancelable = true;
    eventData.view = window;
    eventData.dataTransfer = new DataTransfer();

    if (
        eventData.type === 'dragover' &&
        element &&
        __lastElement &&
        element != __lastElement
    ) {
        var leaveData = Object.assign({}, eventData, {type: 'dragleave'});
        var lastElementOffset = getOffset(__lastElement);
        __lastElement.dispatchEvent(new DragEvent(leaveData.type, leaveData));
        
        var enterData = Object.assign({}, eventData, {type: 'dragenter'});
        element.dispatchEvent(new DragEvent(enterData.type, enterData));
        __lastElement = element;
    }
    else if (eventData.type === 'dragover' && element && !__lastElement) {
        __lastElement = element;
    }
    else {
        __lastElement = null;
    }
    if (element) {
        element.dispatchEvent(new DragEvent(eventData.type, eventData));
    }
}

export
function decodeDragEvents(windowObject: any = window) {
    windowObject.addEventListener('message', function(event: MessageEvent) {
        if (!event.data || event.data.messageType !== MESSAGE_TYPE_ID) {
            return;
        }
        handleDnDMessage(windowObject, event);
    });
}