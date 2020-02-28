import { TObserverParameters, TSubscribeFunction, TWrapSubscribeFunctionFactory } from '../types';

export const createWrapSubscribeFunction: TWrapSubscribeFunctionFactory = (patch, toObserver) => {
    const emptyFunction = () => { }; // tslint:disable-line:no-empty

    return <T>(innerSubscribe: TSubscribeFunction<T>) => {
        const subscribe = (...args: TObserverParameters<T>) => {
            const unsubscribe = innerSubscribe(toObserver(...args));

            if (unsubscribe !== undefined) {
                return unsubscribe;
            }

            return emptyFunction;
        };

        subscribe[ Symbol.observable ] = () => ({ subscribe: (...args: TObserverParameters<T>) => ({ unsubscribe: subscribe(...args) }) });

        return patch(subscribe);
    };
};
