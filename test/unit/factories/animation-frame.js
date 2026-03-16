import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAnimationFrame } from '../../../src/factories/animation-frame';

describe('animationFrame()', () => {
    let animationFrame;
    let emitNotSupportedError;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = vi.fn();
        wrapSubscribeFunction = vi.fn();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            animationFrame = createAnimationFrame(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            animationFrame();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(animationFrame()).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                animationFrame();
            });

            it('should call emitNotSupportedError() with the given observer', () => {
                subscribe(observer);

                expect(emitNotSupportedError).to.have.been.calledOnce.and.calledWith(observer);
            });

            it('should return the value returned by emitNotSupportedError()', () => {
                const value = 'a fake return value';

                emitNotSupportedError.mockReturnValue(value);

                expect(subscribe(observer)).to.equal(value);
            });
        });
    });

    describe('with a window object', () => {
        let window;

        beforeEach(() => {
            window = { cancelAnimationFrame: vi.fn(), requestAnimationFrame: vi.fn() };

            animationFrame = createAnimationFrame(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            animationFrame();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(animationFrame()).to.equal(value);
        });

        describe('subscribe()', () => {
            let callback;
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { error: vi.fn(), next: vi.fn() };

                window.requestAnimationFrame.mockImplementation((value) => (callback = value));
                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                animationFrame();
            });

            it('should request an animation frame', () => {
                subscribe(observer);

                expect(window.requestAnimationFrame).to.have.been.calledOnce;
                expect(window.requestAnimationFrame).to.have.been.calledWith(expect.any(Function));
            });

            it('should request another animation frame', () => {
                subscribe(observer);

                window.requestAnimationFrame.mockReset();

                callback('a fake timestamp'); // eslint-disable-line node/no-callback-literal

                expect(window.requestAnimationFrame).to.have.been.calledOnce;
                expect(window.requestAnimationFrame).to.have.been.calledWith(expect.any(Function));
            });

            it('should call next() with the given timestamp on each animation frame', () => {
                subscribe(observer);

                const timestamp = 'a fake timestamp';

                callback(timestamp);

                expect(observer.next).to.have.been.calledOnce.and.calledWith(timestamp);
            });

            it('should request another animation frame before calling next()', () => {
                subscribe(observer);

                window.requestAnimationFrame.mockReset();

                callback('a fake timestamp'); // eslint-disable-line node/no-callback-literal

                expect(window.requestAnimationFrame).to.have.been.calledBefore(observer.next);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let animationFrameHandle;
            let unsubscribe;

            beforeEach(() => {
                animationFrameHandle = 'a fake animation frame handle';

                window.requestAnimationFrame.mockImplementation(() => animationFrameHandle);
                wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe()));

                animationFrame();
            });

            it('should cancel the requested animation frame', () => {
                unsubscribe();

                expect(window.cancelAnimationFrame).to.have.been.calledOnce.and.calledWith(animationFrameHandle);
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
