import { TSubscribableThing, TWrapSubscribeFunctionFunction } from '../types';

export const createPrependSubscribableThing =
    (wrapSubscribeFunction: TWrapSubscribeFunctionFunction) =>
    <TValue, TPrependedValue>(
        subscribableThing: TSubscribableThing<TValue>,
        prependedValue: TPrependedValue
    ): TSubscribableThing<TPrependedValue | TValue> =>
        wrapSubscribeFunction((observer) => {
            observer.next(prependedValue);

            return subscribableThing(observer);
        });
