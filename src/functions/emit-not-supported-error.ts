import { TEmitNotSupportedErrorFunction } from '../types';

export const emitNotSupportedError: TEmitNotSupportedErrorFunction = (observer) => {
    observer.error(new Error('The required browser API seems to be not supported.'));

    return () => {}; // tslint:disable-line:no-empty
};
