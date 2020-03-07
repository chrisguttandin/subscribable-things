import { patch, toObserver } from 'rxjs-interop';
import { createMediaDevices } from './factories/media-devices';
import { createMediaQueryMatch } from './factories/media-query-match';
import { createMutations } from './factories/mutations';
import { createPermissionState } from './factories/permission-state';
import { createReports } from './factories/reports';
import { createResizes } from './factories/resizes';
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

export const mediaDevices = createMediaDevices(emitNotSupportedError, window, wrapSubscribeFunction);

export const mediaQueryMatch = createMediaQueryMatch(emitNotSupportedError, window, wrapSubscribeFunction);

export const mutations = createMutations(emitNotSupportedError, window, wrapSubscribeFunction);

export const permissionState = createPermissionState(emitNotSupportedError, window, wrapSubscribeFunction);

export const reports = createReports(emitNotSupportedError, window, wrapSubscribeFunction);

export const resizes = createResizes(emitNotSupportedError, window, wrapSubscribeFunction);
