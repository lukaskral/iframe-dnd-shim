# Cross frame drag'n'drop for mobile devices

Small helper library to help with cross frame drag'n'drop on mobile devices.

It requires a shim library installed to support drag'n'drop for mobile devices, for example https://github.com/timruffles/ios-html5-drag-drop-shim.

## Install
```
npm install iframe-dnd-shim
```

## Include into the project
for basic usage include this code snippet into your project
```
import { encodeDragEvents } from 'iframe-dnd-shim';


// ...
var iframes = document.getElementsByTagName('iframe');
for (var i = 0; i < iframes.length; i++) {
    encodeDragEvents(iframes[i]);
}
```

## Options
The ```encodeDragEvents``` method takes 2 arguments. The first is the iframe you want to use wor the drag'n'drop, the second is options argument.

At the moment tfollowing options are available:
- ```domain```, set to '*' by default. This is a rescriciton which domain is allowed to send the messages to and it is recommended to set it up accordingly.
- ```injectDecodeFunction```, set to true by default. If enabled, it tries to inject the decode function into the iframe. This is only possible when it is allowed by the cross domain restrictions (iframe must be on the same domain os a host page).

## Cross domain usage
If the iframe is hosted on the different domain, it is required to decode the messages manually. You can do it by including ```decodeDragEvents``` function into the iframe code, like this:
```
import { encodeDragEvents } from 'iframe-dnd-shim';
decodeDragEvents();
```
After you do this, received messages are transcoded to the drag events and dispatched on the correct dom nodes.