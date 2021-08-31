import { TEmitNotSupportedErrorFunction, TSubscribableThing, TWindow, TWrapSubscribeFunctionFunction } from '../types';

export const createGeolocation = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => {
    return (options?: PositionOptions): TSubscribableThing<GeolocationPosition> =>
        wrapSubscribeFunction((observer) => {
            if (
                window === null ||
                window.navigator === undefined ||
                window.navigator.geolocation === undefined ||
                window.navigator.geolocation.clearWatch === undefined ||
                window.navigator.geolocation.watchPosition === undefined
            ) {
                return emitNotSupportedError(observer);
            }

            const watchId = window.navigator.geolocation.watchPosition(
                (position) => observer.next(position),
                (err) => observer.error(err),
                options
            );

            return () => window.navigator.geolocation.clearWatch(watchId);
        });
};
