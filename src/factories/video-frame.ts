import { TVideoFrameFactory } from '../types';

export const createVideoFrame: TVideoFrameFactory = (emitNotSupportedError, wrapSubscribeFunction) => {
    return (videoElement) =>
        wrapSubscribeFunction((observer) => {
            if (videoElement.cancelVideoFrameCallback === undefined || videoElement.requestVideoFrameCallback === undefined) {
                return emitNotSupportedError(observer);
            }

            let videoFrameHandle = videoElement.requestVideoFrameCallback(function videoFrameCallback(now, metadata): void {
                observer.next({ ...metadata, now });

                videoFrameHandle = videoElement.requestVideoFrameCallback(videoFrameCallback);
            });

            return () => videoElement.cancelVideoFrameCallback(videoFrameHandle);
        });
};
