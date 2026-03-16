// eslint-disable-next-line max-classes-per-file
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createReports } from '../../../src/factories/reports';

describe('reports()', () => {
    let emitNotSupportedError;
    let reports;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = vi.fn();
        wrapSubscribeFunction = vi.fn();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            reports = createReports(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            reports();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(reports()).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                reports();
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
            window = { ReportingObserver: vi.fn() };

            reports = createReports(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            reports();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(reports()).to.equal(value);
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

                window.ReportingObserver.mockImplementation(
                    class {
                        constructor(value) {
                            this.observe = observe;

                            callback = value;
                        }
                    }
                );
                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                reports(options);
            });

            it('should create a new ReportingObserver with the given options object', () => {
                subscribe(observer);

                expect(window.ReportingObserver).to.have.been.calledOnce;
                expect(window.ReportingObserver).to.have.been.calledWith(expect.any(Function), options);
            });

            it('should call observe()', () => {
                subscribe(observer);

                expect(observe).to.have.been.calledOnce.and.calledWith();
            });

            it('should call next() with the current reports on each invocation of the callback', () => {
                subscribe(observer);

                const reportList = ['a', 'fake', 'list', 'of', 'reports'];

                callback(reportList);

                expect(observer.next).to.have.been.calledOnce.and.calledWith(reportList);
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

                window.ReportingObserver.mockImplementation(
                    class {
                        constructor() {
                            this.disconnect = disconnect;
                            this.observe = vi.fn();
                        }
                    }
                );
                wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe()));

                reports();
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
