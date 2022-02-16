import { TSubscribableThing, TWrapSubscribeFunctionFunction } from '../types';

export const createMapSubscribableThing =
    (wrapSubscribeFunction: TWrapSubscribeFunctionFunction) =>
    <TValue, TMappedValue>(
        subscribableThing: TSubscribableThing<TValue>,
        map: (value: TValue) => TMappedValue
    ): TSubscribableThing<TMappedValue> =>
        wrapSubscribeFunction((observer) => subscribableThing({ ...observer, next: (value) => observer.next(map(value)) }));
