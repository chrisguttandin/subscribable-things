import { patch, toObserver } from 'rxjs-interop';
import { createMediaQueryMatches } from './factories/media-query-matches';
import { createWrapSubscribeFunction } from './factories/wrap-subscribe-function';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './types/index';

const wrapSubscribeFunction = createWrapSubscribeFunction(patch, toObserver);

export const mediaQueryMatches = createMediaQueryMatches(window, wrapSubscribeFunction);
