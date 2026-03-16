import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createVideoFrame } from '../../../src/factories/video-frame';

describe('videoFrame()', () => {
    let emitNotSupportedError;
    let videoFrame;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = vi.fn();
        wrapSubscribeFunction = vi.fn();

        videoFrame = createVideoFrame(emitNotSupportedError, wrapSubscribeFunction);
    });

    it('should call wrapSubscribeFunction()', () => {
        videoFrame({ a: 'fake', html: 'video element' });

        expect(wrapSubscribeFunction).to.have.been.calledOnce;
        expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
    });

    it('should return the value returned by wrapSubscribeFunction()', () => {
        const value = 'a fake return value';

        wrapSubscribeFunction.mockReturnValue(value);

        expect(videoFrame({ a: 'fake', html: 'video element' })).to.equal(value);
    });

    describe('subscribe()', () => {
        let callback;
        let observer;
        let subscribe;
        let videoElement;

        beforeEach(() => {
            videoElement = {
                cancelVideoFrameCallback: vi.fn(),
                requestVideoFrameCallback: vi.fn()
            };
            observer = { next: vi.fn() };

            videoElement.requestVideoFrameCallback.mockImplementation((value) => (callback = value));
            wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

            videoFrame(videoElement);
        });

        it('should request a video frame', () => {
            subscribe(observer);

            expect(videoElement.requestVideoFrameCallback).to.have.been.calledOnce;
            expect(videoElement.requestVideoFrameCallback).to.have.been.calledWith(expect.any(Function));
        });

        it('should request another video frame', () => {
            subscribe(observer);

            videoElement.requestVideoFrameCallback.mockReset();

            callback('a fake timestamp', { a: 'fake', metadata: 'object' }); // eslint-disable-line node/no-callback-literal

            expect(videoElement.requestVideoFrameCallback).to.have.been.calledOnce;
            expect(videoElement.requestVideoFrameCallback).to.have.been.calledWith(expect.any(Function));
        });

        it('should call next() with the given timestamp combined with the metadata on each video frame', () => {
            subscribe(observer);

            const metadata = { a: 'fake', metadata: 'object' };
            const now = 'a fake timestamp';

            callback(now, metadata);

            expect(observer.next).to.have.been.calledOnce.and.calledWith({ now, ...metadata });
        });

        it('should request another video frame before calling next()', () => {
            subscribe(observer);

            videoElement.requestVideoFrameCallback.mockReset();

            callback('a fake timestamp', { a: 'fake', metadata: 'object' }); // eslint-disable-line node/no-callback-literal

            expect(videoElement.requestVideoFrameCallback).to.have.been.calledBefore(observer.next);
        });

        it('should return a function', () => {
            expect(subscribe(observer)).to.be.a('function');
        });
    });

    describe('unsubscribe()', () => {
        let videoElement;
        let videoFrameHandle;
        let unsubscribe;

        beforeEach(() => {
            videoElement = {
                cancelVideoFrameCallback: vi.fn(),
                requestVideoFrameCallback: vi.fn()
            };
            videoFrameHandle = 'a fake video frame handle';

            videoElement.requestVideoFrameCallback.mockImplementation(() => videoFrameHandle);
            wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe({ next() {} })));

            videoFrame(videoElement);
        });

        it('should cancel the requested video frame', () => {
            unsubscribe();

            expect(videoElement.cancelVideoFrameCallback).to.have.been.calledOnce.and.calledWith(videoFrameHandle);
        });

        it('should return undefined', () => {
            expect(unsubscribe()).to.be.undefined;
        });
    });
});
