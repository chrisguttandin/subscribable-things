import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createUnhandledRejection } from '../../../src/factories/unhandled-rejection';

describe('unhandledRejection()', () => {
    let emitNotSupportedError;
    let unhandledRejection;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = vi.fn();
        wrapSubscribeFunction = vi.fn();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            unhandledRejection = createUnhandledRejection(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            unhandledRejection(100);

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(unhandledRejection(100)).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                unhandledRejection(100);
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
            window = { addEventListener: vi.fn(), clearInterval: vi.fn(), removeEventListener: vi.fn(), setInterval: vi.fn() };

            unhandledRejection = createUnhandledRejection(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            unhandledRejection(100);

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(unhandledRejection(100)).to.equal(value);
        });

        describe('subscribe()', () => {
            let coolingOffPeriod;
            let intervalId;
            let observer;
            let rejectionHandledEventListener;
            let subscribe;
            let unhandledRejectionEventListener;

            afterEach(() => clearInterval(intervalId));

            beforeEach(() => {
                coolingOffPeriod = 100;
                observer = { error: vi.fn(), next: vi.fn() };

                window.addEventListener.mockImplementation((type, value) => {
                    if (type === 'rejectionhandled') {
                        rejectionHandledEventListener = value;
                    } else {
                        unhandledRejectionEventListener = value;
                    }
                });
                window.setInterval.mockImplementation((...args) => {
                    intervalId = setInterval(...args);

                    return intervalId;
                });
                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                unhandledRejection(coolingOffPeriod);
            });

            it('should register a rejectionhandled event listener', () => {
                subscribe(observer);

                expect(window.addEventListener).to.have.been.calledTwice.and.calledWith('rejectionhandled', rejectionHandledEventListener);
            });

            it('should register an unhandledrejection event listener', () => {
                subscribe(observer);

                expect(window.addEventListener).to.have.been.calledTwice.and.calledWith(
                    'unhandledrejection',
                    unhandledRejectionEventListener
                );
            });

            it('should call preventDefault() on each unhandledrejection event', () => {
                subscribe(observer);

                const preventDefault = vi.fn();

                unhandledRejectionEventListener({ preventDefault });

                expect(preventDefault).to.have.been.calledOnce.and.calledWith();
            });

            it('should call setInterval() on the first unhandledrejection event', () => {
                subscribe(observer);

                unhandledRejectionEventListener({ preventDefault() {} });

                expect(window.setInterval).to.have.been.calledOnce;
                expect(window.setInterval).to.have.been.calledWith(expect.any(Function), coolingOffPeriod / 2);
            });

            it('should not call setInterval() on consecutive unhandledrejection events', () => {
                subscribe(observer);

                unhandledRejectionEventListener({ preventDefault() {} });

                window.setInterval.mockClear();

                unhandledRejectionEventListener({ preventDefault() {} });

                expect(window.setInterval).to.have.not.been.called;
            });

            it('should call next() with the reason when the cooling period did elapse', () => {
                const { promise, resolve } = Promise.withResolvers();

                subscribe(observer);

                const reason = 'a fake reason';

                unhandledRejectionEventListener({ preventDefault() {}, reason });

                expect(observer.next).to.have.not.been.called;

                setTimeout(() => {
                    expect(observer.next).to.have.been.calledOnce.and.calledWith(reason);

                    resolve();
                }, coolingOffPeriod * 2);

                return promise;
            });

            it('should not call next() with the reason if the rejectionhandled did fire before the cooling period did elapse', () => {
                const { promise, resolve } = Promise.withResolvers();

                subscribe(observer);

                const reason = 'a fake reason';

                unhandledRejectionEventListener({ preventDefault() {}, reason });
                rejectionHandledEventListener({ reason });

                setTimeout(() => {
                    expect(observer.next).to.have.not.been.called;

                    resolve();
                }, coolingOffPeriod * 2);

                return promise;
            });

            it('should call clearInterval() when there is no remaining possibly unhandled rejection', () => {
                const { promise, resolve } = Promise.withResolvers();

                subscribe(observer);

                const reason = 'a fake reason';

                unhandledRejectionEventListener({ preventDefault() {}, reason });
                rejectionHandledEventListener({ reason });

                setTimeout(() => {
                    expect(window.clearInterval).to.have.been.calledOnce.and.calledWith(intervalId);

                    resolve();
                }, coolingOffPeriod * 2);

                return promise;
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let intervalId;
            let rejectionHandledEventListener;
            let unhandledRejectionEventListener;
            let unsubscribe;

            beforeEach(() => {
                intervalId = 1;

                window.addEventListener.mockImplementation((type, value) => {
                    if (type === 'rejectionhandled') {
                        rejectionHandledEventListener = value;
                    } else {
                        unhandledRejectionEventListener = value;
                    }
                });
                window.setInterval.mockReturnValue(intervalId);
                wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe({ next() {} })));

                unhandledRejection(100);
            });

            it('should not call clearInterval()', () => {
                unsubscribe();

                expect(window.clearInterval).to.have.not.been.called;
            });

            it('should call clearInterval()', () => {
                unhandledRejectionEventListener({ preventDefault() {} });

                unsubscribe();

                expect(window.clearInterval).to.have.been.calledOnce.and.calledWith(intervalId);
            });

            it('should remove the rejectionhandled event listener', () => {
                unsubscribe();

                expect(window.removeEventListener).to.have.been.calledTwice.and.calledWith(
                    'rejectionhandled',
                    rejectionHandledEventListener
                );
            });

            it('should remove the unhandledrejection event listener', () => {
                unsubscribe();

                expect(window.removeEventListener).to.have.been.calledTwice.and.calledWith(
                    'unhandledrejection',
                    unhandledRejectionEventListener
                );
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
