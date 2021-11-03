import { patch, toObserver } from 'rxjs-interop';
import { createWrapSubscribeFunction } from '../../src/factories/wrap-subscribe-function';

const wrapSubscribeFunction = createWrapSubscribeFunction(patch, toObserver);

export const map = (observable, mapValue) =>
    wrapSubscribeFunction(({ next, ...args }) => {
        const { unsubscribe } = observable[Symbol.observable]().subscribe({
            ...args,
            next: (value) => next(mapValue(value))
        });

        return () => unsubscribe();
    });
