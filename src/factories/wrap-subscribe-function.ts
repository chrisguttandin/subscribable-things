import { Observer, Subscribable } from 'rxjs-interop';
import { TObserverParameters, TSubscribableThing, TSubscribeFunction, TWrapSubscribeFunctionFactory } from '../types';

export const createWrapSubscribeFunction: TWrapSubscribeFunctionFactory = (patch, toObserver) => {
    const emptyFunction = () => {}; // tslint:disable-line:no-empty
    const isNextFunction = <T>(args: TObserverParameters<T>): args is [Observer<T>['next']] => typeof args[0] === 'function';

    return <T>(innerSubscribe: TSubscribeFunction<T>) => {
        const subscribe = <TSubscribableThing<T>>((...args: TObserverParameters<T>) => {
            const unsubscribe = innerSubscribe(isNextFunction(args) ? toObserver({ next: args[0] }) : toObserver(...args));

            if (unsubscribe !== undefined) {
                return unsubscribe;
            }

            return emptyFunction;
        });

        subscribe[Symbol.observable] = () => ({
            subscribe: (...args: Parameters<Subscribable<T>['subscribe']>) => ({ unsubscribe: subscribe(...args) })
        });

        return patch(subscribe);
    };
};
