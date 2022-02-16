import { patch, toObserver } from 'rxjs-interop';
import { createAnimationFrame } from './factories/animation-frame';
import { createAttribute } from './factories/attribute';
import { createGeolocation } from './factories/geolocation';
import { createIntersections } from './factories/intersections';
import { createMapSubscribableThing } from './factories/map-subscribable-thing';
import { createMediaDevices } from './factories/media-devices';
import { createMediaQueryMatch } from './factories/media-query-match';
import { createMetrics } from './factories/metrics';
import { createMidiInputs } from './factories/midi-inputs';
import { createMidiOutputs } from './factories/midi-outputs';
import { createMutations } from './factories/mutations';
import { createOn } from './factories/on';
import { createOnline } from './factories/online';
import { createPermissionState } from './factories/permission-state';
import { createPrependSubscribableThing } from './factories/prepend-subscribable-thing';
import { createReports } from './factories/reports';
import { createResizes } from './factories/resizes';
import { createUnhandledRejection } from './factories/unhandled-rejection';
import { createVideoFrame } from './factories/video-frame';
import { createWakeLock } from './factories/wake-lock';
import { createWindow } from './factories/window';
import { createWrapSubscribeFunction } from './factories/wrap-subscribe-function';
import { emitNotSupportedError } from './functions/emit-not-supported-error';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';

const window = createWindow();
const wrapSubscribeFunction = createWrapSubscribeFunction(patch, toObserver);

export const animationFrame = createAnimationFrame(emitNotSupportedError, window, wrapSubscribeFunction);

export const mutations = createMutations(emitNotSupportedError, window, wrapSubscribeFunction);

const mapSubscribableThing = createMapSubscribableThing(wrapSubscribeFunction);
const prependSubscribableThing = createPrependSubscribableThing(wrapSubscribeFunction);

export const attribute = createAttribute(mapSubscribableThing, mutations, prependSubscribableThing);

export const geolocation = createGeolocation(emitNotSupportedError, window, wrapSubscribeFunction);

export const intersections = createIntersections(emitNotSupportedError, window, wrapSubscribeFunction);

export const mediaDevices = createMediaDevices(emitNotSupportedError, window, wrapSubscribeFunction);

export const mediaQueryMatch = createMediaQueryMatch(emitNotSupportedError, window, wrapSubscribeFunction);

export const metrics = createMetrics(emitNotSupportedError, window, wrapSubscribeFunction);

export const midiInputs = createMidiInputs(wrapSubscribeFunction);

export const midiOutputs = createMidiOutputs(wrapSubscribeFunction);

export const on = createOn(wrapSubscribeFunction);

export const online = createOnline(emitNotSupportedError, window, wrapSubscribeFunction);

export const permissionState = createPermissionState(emitNotSupportedError, window, wrapSubscribeFunction);

export const reports = createReports(emitNotSupportedError, window, wrapSubscribeFunction);

export const resizes = createResizes(emitNotSupportedError, window, wrapSubscribeFunction);

export const unhandledRejection = createUnhandledRejection(emitNotSupportedError, window, wrapSubscribeFunction);

export const videoFrame = createVideoFrame(emitNotSupportedError, wrapSubscribeFunction);

export const wakeLock = createWakeLock(emitNotSupportedError, window, wrapSubscribeFunction);
