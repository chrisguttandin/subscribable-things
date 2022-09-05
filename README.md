![logo](https://repository-images.githubusercontent.com/243833305/16fbe600-64ca-11ea-8f60-736c8d74ec0f)

# subscribable-things

**A collection of reactive wrappers for various browser APIs.**

[![version](https://img.shields.io/npm/v/subscribable-things.svg?style=flat-square)](https://www.npmjs.com/package/subscribable-things)

This package provides factory functions which can be used to turn browser APIs into subscribable things. A subscribable thing can either be consumed directly with callback functions or by utilzing one of the popular libraries for reactive programming.

## Usage

The `subscribable-things` package is published on [npm](https://www.npmjs.com/package/subscribable-things) and can be installed as usual.

```shell
npm install subscribable-things
```

It exports individual functions for each wrapped browser API which are described in greater detail below. They can either be used directly by providing a callback function ...

```js
import { mediaQueryMatch } from 'subscribable-things';

const subscribe = mediaQueryMatch('(max-width:600px)');

const unsubscribe = subscribe((isMatching) => console.log(isMatching));

unsubscribe();
```

... or by utilizing a library for reactive programming like [RxJS](https://rxjs-dev.firebaseapp.com) ...

```js
import { from } from 'rxjs';
import { mediaQueryMatch } from 'subscribable-things';

const mediaQueryMatch$ = from(mediaQueryMatch('(max-width:600px)'));

const subscription = mediaQueryMatch$.subscribe((isMatching) => console.log(isMatching));

subscription.unsubscribe();
```

... or [Callbags](https://github.com/callbag/callbag) ...

```js
import fromObs from 'callbag-from-obs';
import observe from 'callbag-observe';
import { mediaQueryMatch } from 'subscribable-things';

const source = fromObs(mediaQueryMatch('(max-width:600px)'));

observe((isMatching) => console.log(isMatching))(source);
```

... or [XStream](https://staltz.github.io/xstream) ...

```js
import { mediaQueryMatch } from 'subscribable-things';
import { fromObservable } from 'xstream';

const stream = fromObservable(mediaQueryMatch('(max-width:600px)'));

const unsubscribe = stream.subscribe((isMatching) => console.log(isMatching));

unsubscribe();
```

... or [Bacon.js](https://baconjs.github.io) ...

```js
import { fromESObservable } from 'baconjs';
import { mediaQueryMatch } from 'subscribable-things';

const eventStream = fromESObservable(mediaQueryMatch('(max-width:600px)'));

const unsubscribe = eventStream.onValue((isMatching) => console.log(isMatching));

unsubscribe();
```

... or [Kefir.js](https://kefirjs.github.io/kefir).

```js
import { fromESObservable } from 'kefir';
import { mediaQueryMatch } from 'subscribable-things';

const stream = fromESObservable(mediaQueryMatch('(max-width:600px)'));

const subscription = stream.observe({
    value(isMatching) {
        console.log(isMatching);
    }
});

subscription.unsubscribe();
```

It is even possible to consume `subscribable-things` as an async iterable by taking the little detour over RxJS and [rxjs-for-await](https://github.com/benlesh/rxjs-for-await).

```js
import { eachValueFrom } from 'rxjs-for-await';
import { from } from 'rxjs';
import { mediaQueryMatch } from 'subscribable-things';

const source$ = from(mediaQueryMatch('(max-width:600px)'));

for await (const isMatching of eachValueFrom(source$)) {
    console.log(isMatching);
}
```

Also it's possible to output values directly to HTML via [hyperf](https://github.com/spectjs/hyperf).

```js
import h from 'hyperf';
import { mediaQueryMatch } from 'subscribable-things';

const element = h`<div>is matching: ${mediaQueryMatch('(max-width:600px)')}</div>`;

document.body.appendChild(element);
```

### animationFrame()

```ts
function animationFrame(): SubscribableThing<number>;
```

This function wraps the [`requestAnimationFrame()`](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#dom-animationframeprovider-requestanimationframe) method. It emits the current timestamp of each animation frame.

### attribute(htmlElement, name)

```ts
function attribute(htmlElement: HTMLElement, name: string): TSubscribableThing<null | string>;
```

This function uses `mutations()` on the inside to emit the latest value of the attribute with the given name.

### geolocation([options])

```ts
function geolocation(options?: PositionOptions): SubscribableThing<GeolocationPosition>;
```

This is a wrapper for the [Geolocation API](https://w3c.github.io/geolocation-api/). It uses [`watchPosition()`](https://w3c.github.io/geolocation-api/#watchposition-method) to gather the most recent [`GeolocationPosition`](https://w3c.github.io/geolocation-api/#dfn-a-new-geolocationposition) whenever it changes.

### intersections(htmlElement, [options])

```ts
function intersections(
    htmlElement: HTMLElement,
    options?: IntersectionObserverInit
): SubscribableThing<IntersectionObserverEntry[]>;
```

This function is a wrapper for the [`IntersectionObserver`](https://developer.mozilla.org/docs/Web/API/IntersectionObserver).

### mediaDevices()

```ts
function mediaDevices(): SubscribableThing<MediaDeviceInfo[]>;
```

This function is a wrapper for the [`enumerateDevices()`](https://developer.mozilla.org/docs/Web/API/MediaDevices/enumerateDevices) method of the [Media Capture and Streams specification](https://w3c.github.io/mediacapture-main). It will also listen for the [`devicechange` event](https://developer.mozilla.org/docs/Web/API/MediaDevices/devicechange_event) to emit a fresh list of devices whenever they change.

### mediaQueryMatch(mediaQueryString)

```ts
function mediaQueryMatch(mediaQueryString: string): SubscribableThing<boolean>;
```

This function is a wrapper for the [`matchMedia()`](https://developer.mozilla.org/docs/Web/API/Window/matchMedia) method. It will emit a new value whenever the result of `matchMedia()` changes.

### midiInputs(midiAccess)

```ts
function midiInputs(midiAccess: IMidiAccess): SubscribableThing<IMidiInput[]>;
```

This function returns the currently available MIDI input devices. It accepts a [`MIDIAccess`](https://developer.mozilla.org/docs/Web/API/MIDIAccess) object of the [Web MIDI API](https://webaudio.github.io/web-midi-api).

### midiOutputs(midiAccess)

```ts
function midiOutputs(midiAccess: IMidiAccess): SubscribableThing<IMidiOutput[]>;
```

This function returns the currently available MIDI output devices. It accepts a [`MIDIAccess`](https://developer.mozilla.org/docs/Web/API/MIDIAccess) object of the [Web MIDI API](https://webaudio.github.io/web-midi-api).

### metrics(options)

```ts
function metrics(options: PerformanceObserverInit): SubscribableThing<PerformanceEntry[]>;
```

This function is a wrapper for the [`PerformanceObserver`](https://developer.mozilla.org/docs/Web/API/PerformanceObserver) as defined by the [Performance Timeline Level 2 specification](https://w3c.github.io/performance-timeline).

### mutations(htmlElement, options)

```ts
function mutations(
    htmlElement: HTMLElement,
    options: MutationObserverInit
): SubscribableThing<MutationRecord[]>;
```

This function is a wrapper for the [`MutationObserver`](https://developer.mozilla.org/docs/Web/API/MutationObserver).

### on(target, type, [options])

```ts
function on(
    target: EventTarget,
    type: string,
    options?: boolean | AddEventListenerOptions
): SubscribableThing<Event>;
```

This function can be used to subscribe to events of a certain type dispatched from an [`EventTarget`](https://dom.spec.whatwg.org/#interface-eventtarget).

### online()

```ts
function online(): SubscribableThing<boolean>;
```

This function wraps the [`onLine`](https://developer.mozilla.org/docs/Web/API/NavigatorOnLine/onLine) property of the [`Navigator`](https://developer.mozilla.org/docs/Web/API/Navigator) and listens for the corresponding [`'online'`](https://developer.mozilla.org/docs/Web/API/Window/online_event) and [`'offline'`](https://developer.mozilla.org/docs/Web/API/Window/offline_event) events on the [`Window`](https://developer.mozilla.org/docs/Web/API/Window) to emit updates.

### permissionState(permissionDescriptor)

```ts
function permissionState(
    permissionDescriptor: PermissionDescriptor
): SubscribableThing<PermissionState>;
```

This function is a wrapper for the [`query()`](https://developer.mozilla.org/docs/Web/API/Permissions/query) method of the [Permissions API](https://w3c.github.io/permissions). It will monitor the permission status to emit a new state whenever it gets updated.

### reports([options])

```ts
function reports(options?: IReportingObserverOptions): SubscribableThing<IReport[]>;
```

This function is a wrapper for the [`ReportingObserver`](https://developer.mozilla.org/docs/Web/API/ReportingObserver) of the [Reporting API](https://w3c.github.io/reporting).

### resizes(htmlElement, [options])

```ts
function resizes(
    htmlElement: HTMLElement,
    options?: IResizesObserverOptions
): SubscribableThing<IResizeObserverEntry[]>;
```

This function is a wrapper for the [`ResizeObserver`](https://developer.mozilla.org/docs/Web/API/ResizeObserver) of the [Resize Observer specification](https://drafts.csswg.org/resize-observer).

### unhandledRejection(coolingOffPeriod)

```ts
function unhandledRejection(coolingOffPeriod: number): SubscribableThing<any>;
```

This function emits unhandled rejections. It will listen for the [`unhandledrejection` event](https://developer.mozilla.org/docs/Web/API/Window/unhandledrejection_event) to register possibly unhandled rejections. It will then wait for the cooling-off period to elapse before it emits the reason (aka the error) that caused the unhandled rejection. It is possible that a previously unhandled rejection gets handled later on in which case a [`rejectionhandled` event](https://developer.mozilla.org/docs/Web/API/Window/rejectionhandled_event) will be fired. If that happens during the cooling-off period nothing will be emitted by this function.

### videoFrame(videoElement)

```ts
function videoFrame(
    videoElement: HTMLVideoElement
): SubscribableThing<{ now: number } & IVideoFrameMetadata>;
```

This function wraps the [`requestVideoFrameCallback()`](https://wicg.github.io/video-rvfc) method of the given [`HTMLVideoElement`](https://html.spec.whatwg.org/multipage/media.html#htmlvideoelement). It emits the current timestamp combined with the [`VideoFrameMetadata`](https://wicg.github.io/video-rvfc/#video-frame-metadata) object.

### wakeLock(type)

```ts
function wakeLock(type: TWakeLockType): SubscribableThing<boolen>;
```

This function simplifies the usage of the [Screen Wake Lock API](https://w3c.github.io/screen-wake-lock). It emits true when a wake lock could be acquired and emits false once the wake lock gets released by the browser. As long as the subscription is alive it will continuosly try to get a new wake lock if the current one gets released.

## Alternatives

There are two similar packages available which are based directly on RxJS. They are [rx-use](https://github.com/streamich/rx-use) and [rxjs-web](https://github.com/niklas-wortmann/rxjs-web).
