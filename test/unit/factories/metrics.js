// eslint-disable-next-line max-classes-per-file
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMetrics } from '../../../src/factories/metrics';

describe('metrics()', () => {
    let emitNotSupportedError;
    let metrics;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = vi.fn();
        wrapSubscribeFunction = vi.fn();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            metrics = createMetrics(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            metrics({});

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(metrics({})).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                metrics({});
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
            window = { PerformanceObserver: vi.fn() };

            metrics = createMetrics(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            metrics({});

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(metrics({})).to.equal(value);
        });

        describe('subscribe()', () => {
            let callback;
            let observe;
            let observer;
            let options;
            let subscribe;

            beforeEach(() => {
                observe = vi.fn();
                observer = { error: vi.fn(), next: vi.fn() };
                options = { a: 'fake', options: 'object' };

                window.PerformanceObserver.mockImplementation(
                    class {
                        constructor(value) {
                            this.observe = observe;

                            callback = value;
                        }
                    }
                );
                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                metrics(options);
            });

            it('should create a new PerformanceObserver', () => {
                subscribe(observer);

                expect(window.PerformanceObserver).to.have.been.calledOnce;
                expect(window.PerformanceObserver).to.have.been.calledWith(expect.any(Function));
            });

            it('should call observe() with the given options object', () => {
                subscribe(observer);

                expect(observe).to.have.been.calledOnce.and.calledWith(options);
            });

            it('should call error() with an error thrown by observe()', () => {
                const err = new Error('a fake error');

                observe.mockThrow(err);

                subscribe(observer);

                expect(observer.error).to.have.been.calledOnce.and.calledWith(err);
            });

            it('should call next() with the current metrics on each invocation of the callback', () => {
                subscribe(observer);

                const entries = ['a', 'fake', 'array', 'of', 'metrics'];
                const entryList = { getEntries: () => entries };

                callback(entryList);

                expect(observer.next).to.have.been.calledOnce.and.calledWith(entries);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let disconnect;
            let unsubscribe;

            beforeEach(() => {
                disconnect = vi.fn();

                window.PerformanceObserver.mockImplementation(
                    class {
                        constructor() {
                            this.disconnect = disconnect;
                            this.observe = vi.fn();
                        }
                    }
                );
                wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe()));

                metrics({});
            });

            it('should call disconnect()', () => {
                unsubscribe();

                expect(disconnect).to.have.been.calledOnce.and.calledWith();
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
