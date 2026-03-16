import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWakeLock } from '../../../src/factories/wake-lock';

describe('wakeLock()', () => {
    let emitNotSupportedError;
    let wakeLock;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = vi.fn();
        wrapSubscribeFunction = vi.fn();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            wakeLock = createWakeLock(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            wakeLock('screen');

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(wakeLock('screen')).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                wakeLock('screen');
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
            window = { navigator: { wakeLock: { request: vi.fn() } } };

            wakeLock = createWakeLock(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            wakeLock('screen');

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(wakeLock('screen')).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;
            let wakeLockSentinel;
            let wakeLockType;

            beforeEach(() => {
                observer = { error: vi.fn(), next: vi.fn() };
                wakeLockSentinel = {};
                wakeLockType = 'screen';

                window.navigator.wakeLock.request.mockResolvedValue(wakeLockSentinel);
                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                wakeLock(wakeLockType);
            });

            it('should call request() with the given wakeLockType', () => {
                subscribe(observer);

                expect(window.navigator.wakeLock.request).to.have.been.calledOnce.and.calledWith(wakeLockType);
            });

            it('should call next() with true when the promise is resolved', async () => {
                subscribe(observer);

                await Promise.resolve();

                expect(observer.next).to.have.been.calledOnce.and.calledWith(true);
            });

            it('should call error() with an error when the promise is rejected', async () => {
                const err = new Error('a fake error');

                window.navigator.wakeLock.request.mockRejectedValue(err);

                subscribe(observer);

                await Promise.resolve();
                await Promise.resolve();

                expect(observer.error).to.have.been.calledOnce.and.calledWith(err);
            });

            it('should call next() with false on each release event', async () => {
                subscribe(observer);

                await Promise.resolve();

                observer.next.mockClear();

                wakeLockSentinel.onrelease();

                expect(observer.next).to.have.been.calledOnce.and.calledWith(false);
            });

            it('should remove the release event listener on each release event', async () => {
                subscribe(observer);

                await Promise.resolve();

                wakeLockSentinel.onrelease();

                expect(wakeLockSentinel.onrelease).to.be.null;
            });

            it('should call request() with the given wakeLockType on each release event', async () => {
                subscribe(observer);

                await Promise.resolve();

                window.navigator.wakeLock.request.mockClear();

                wakeLockSentinel.onrelease();

                expect(window.navigator.wakeLock.request).to.have.been.calledOnce.and.calledWith(wakeLockType);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let observer;
            let unsubscribe;
            let wakeLockSentinel;
            let wakeLockType;

            beforeEach(() => {
                observer = { next: () => {} };
                wakeLockSentinel = { release: vi.fn() };
                wakeLockType = 'screen';

                wakeLockSentinel.release.mockResolvedValue();
                window.navigator.wakeLock.request.mockResolvedValue(wakeLockSentinel);
                wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe(observer)));
            });

            it('should not assign the release event listener when calling unsubscribe() right away', async () => {
                wakeLock(wakeLockType);
                unsubscribe();

                await Promise.resolve();

                expect(wakeLockSentinel.onrelease).to.be.undefined;
            });

            it('should not assign the release event listener when calling unsubscribe() during the first emission', async () => {
                wakeLock(wakeLockType);

                observer.next = () => unsubscribe();

                await Promise.resolve();

                expect(wakeLockSentinel.onrelease).to.be.undefined;
            });

            it('should remove the release event listener', async () => {
                wakeLock(wakeLockType);

                await Promise.resolve();

                unsubscribe();

                expect(wakeLockSentinel.onrelease).to.be.null;
            });

            it('should call release()', async () => {
                wakeLock(wakeLockType);

                await Promise.resolve();

                unsubscribe();

                expect(wakeLockSentinel.release).to.have.been.calledOnce.and.calledWith();
            });

            it('should return undefined', () => {
                wakeLock(wakeLockType);

                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
