# subscribable-things

**A collection of reactive wrappers for various browser APIs.**

[![tests](https://img.shields.io/travis/chrisguttandin/subscribable-things/master.svg?style=flat-square)](https://travis-ci.org/chrisguttandin/subscribable-things)
[![dependencies](https://img.shields.io/david/chrisguttandin/subscribable-things.svg?style=flat-square)](https://www.npmjs.com/package/subscribable-things)
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

const subscription = stream.observe({ value (isMatching) { console.log(isMatching); } });

subscription.unsubscribe();
```

### intersections(htmlElement: HTMLElement, options?: IntersectionObserverInit): SubscribableThing\<IntersectionObserverEntry[]>

This function is a wrapper for the [`IntersectionObserver`](https://developer.mozilla.org/docs/Web/API/IntersectionObserver).

### mediaDevices(): SubscribableThing\<MediaDeviceInfo[]>

This function is a wrapper for the [`enumerateDevices()`](https://developer.mozilla.org/docs/Web/API/MediaDevices/enumerateDevices) method of the [Media Capture and Streams specification](https://w3c.github.io/mediacapture-main). It will also listen for the [`devicechange` event](https://developer.mozilla.org/docs/Web/API/MediaDevices/devicechange_event) to emit a fresh list of devices whenever they change.

### mediaQueryMatch(mediaQueryString: string): SubscribableThing\<boolean>

This function is a wrapper for the [`matchMedia()`](https://developer.mozilla.org/docs/Web/API/Window/matchMedia) method. It will emit a new value whenever the result of `matchMedia()` changes.

### midiInputs(midiAccess: IMidiAccess): SubscribableThing\<IMidiInput[]>

This function returns the currently available MIDI input devices. It accepts a [`MIDIAccess`](https://developer.mozilla.org/docs/Web/API/MIDIAccess) object of the [Web MIDI API](https://webaudio.github.io/web-midi-api).

### midiOutputs(midiAccess: IMidiAccess): SubscribableThing\<IMidiOutput[]>

This function returns the currently available MIDI output devices. It accepts a [`MIDIAccess`](https://developer.mozilla.org/docs/Web/API/MIDIAccess) object of the [Web MIDI API](https://webaudio.github.io/web-midi-api).

### mutations(htmlElement: HTMLElement, options: MutationObserverInit): SubscribableThing\<MutationRecord[]>

This function is a wrapper for the [`MutationObserver`](https://developer.mozilla.org/docs/Web/API/MutationObserver).

### permissionState(permissionDescriptor: PermissionDescriptor): SubscribableThing\<PermissionState>

This function is a wrapper for the [`query()`](https://developer.mozilla.org/docs/Web/API/Permissions/query) method of the [Permissions API](https://w3c.github.io/permissions). It will monitor the permission status to emit a new state whenever it gets updated.

### reports(options?: IReportingObserverOptions): SubscribableThing\<IReport[]>

This function is a wrapper for the [`ReportingObserver`](https://developer.mozilla.org/docs/Web/API/ReportingObserver) of the [Reporting API](https://w3c.github.io/reporting).

### resizes(htmlElement: HTMLElement, options?: IResizesObserverOptions): SubscribableThing\<IResizeObserverEntry[]>

This function is a wrapper for the [`ResizeObserver`](https://developer.mozilla.org/docs/Web/API/ResizeObserver) of the [Resize Observer specification](https://drafts.csswg.org/resize-observer).
