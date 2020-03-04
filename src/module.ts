import { patch, toObserver } from 'rxjs-interop';
import { createMediaQueryMatch } from './factories/media-query-match';
import { createMutations } from './factories/mutations';
import { createPermissionState } from './factories/permission-state';
import { createWindow } from './factories/window';
import { createWrapSubscribeFunction } from './factories/wrap-subscribe-function';
import { emitNotSupportedError } from './functions/emit-not-supported-error';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './types/index';

const window = createWindow();
const wrapSubscribeFunction = createWrapSubscribeFunction(patch, toObserver);

export const mediaQueryMatch = createMediaQueryMatch(emitNotSupportedError, window, wrapSubscribeFunction);

export const mutations = createMutations(emitNotSupportedError, window, wrapSubscribeFunction);

export const permissionState = createPermissionState(emitNotSupportedError, window, wrapSubscribeFunction);
