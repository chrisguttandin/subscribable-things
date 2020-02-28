import { patch, toObserver } from 'rxjs-interop';
import { createMediaQueryMatch } from './factories/media-query-match';
import { createMutations } from './factories/mutations';
import { createPermissionState } from './factories/permission-state';
import { createWrapSubscribeFunction } from './factories/wrap-subscribe-function';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './types/index';

const wrapSubscribeFunction = createWrapSubscribeFunction(patch, toObserver);

export const mediaQueryMatch = createMediaQueryMatch(window, wrapSubscribeFunction);

export const mutations = createMutations(window, wrapSubscribeFunction);

export const permissionState = createPermissionState(window, wrapSubscribeFunction);
