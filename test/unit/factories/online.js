import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOnline } from '../../../src/factories/online';

describe('online()', () => {
    let emitNotSupportedError;
    let online;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = vi.fn();
        wrapSubscribeFunction = vi.fn();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            online = createOnline(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            online();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(online()).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                online();
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
            window = { addEventListener: vi.fn(), navigator: { onLine: 'a fake value' }, removeEventListener: vi.fn() };

            online = createOnline(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            online();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(online()).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let offlineEventListener;
            let onlineEventListener;
            let subscribe;

            beforeEach(() => {
                observer = { next: vi.fn() };

                window.addEventListener.mockImplementation((type, value) => {
                    if (type === 'offline') {
                        offlineEventListener = value;
                    } else {
                        onlineEventListener = value;
                    }
                });
                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                online();
            });

            it('should call next() with the value of navigator.onLine right away', () => {
                subscribe(observer);

                expect(observer.next).to.have.been.calledOnce.and.calledWith(window.navigator.onLine);
            });

            it('should register an offline event listener', () => {
                subscribe(observer);

                expect(window.addEventListener).to.have.been.calledTwice.and.calledWith('offline', offlineEventListener);
            });

            it('should register an online event listener', () => {
                subscribe(observer);

                expect(window.addEventListener).to.have.been.calledTwice.and.calledWith('online', onlineEventListener);
            });

            it('should call next() with false on each offline event', () => {
                subscribe(observer);

                observer.next.mockClear();

                offlineEventListener();

                expect(observer.next).to.have.been.calledOnce.and.calledWith(false);
            });

            it('should call next() with true on each online event', () => {
                subscribe(observer);

                observer.next.mockClear();

                onlineEventListener();

                expect(observer.next).to.have.been.calledOnce.and.calledWith(true);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let offlineEventListener;
            let onlineEventListener;
            let unsubscribe;

            beforeEach(() => {
                window.addEventListener.mockImplementation((type, value) => {
                    if (type === 'offline') {
                        offlineEventListener = value;
                    } else {
                        onlineEventListener = value;
                    }
                });
                wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe({ next() {} })));

                online();
            });

            it('should remove the offline event listener', () => {
                unsubscribe();

                expect(window.removeEventListener).to.have.been.calledTwice.and.calledWith('offline', offlineEventListener);
            });

            it('should remove the online event listener', () => {
                unsubscribe();

                expect(window.removeEventListener).to.have.been.calledTwice.and.calledWith('online', onlineEventListener);
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
