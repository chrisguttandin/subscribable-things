import { spy, stub } from 'sinon';
import { createMetrics } from '../../../src/factories/metrics';

describe('metrics()', () => {
    let emitNotSupportedError;
    let metrics;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = stub();
        wrapSubscribeFunction = stub();
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

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(metrics({})).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                metrics({});
            });

            it('should call emitNotSupportedError() with the given observer', () => {
                subscribe(observer);

                expect(emitNotSupportedError).to.have.been.calledOnce.and.calledWithExactly(observer);
            });

            it('should return the value returned by emitNotSupportedError()', () => {
                const value = 'a fake return value';

                emitNotSupportedError.returns(value);

                expect(subscribe(observer)).to.equal(value);
            });
        });
    });

    describe('with a window object', () => {
        let window;

        beforeEach(() => {
            window = { PerformanceObserver: stub() };

            metrics = createMetrics(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            metrics({});

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(metrics({})).to.equal(value);
        });

        describe('subscribe()', () => {
            let callback;
            let observer;
            let options;
            let performanceObserver;
            let subscribe;

            beforeEach(() => {
                observer = { error: spy(), next: spy() };
                options = { a: 'fake', options: 'object' };
                performanceObserver = { observe: stub() };

                window.PerformanceObserver.callsFake((value) => {
                    callback = value;

                    return performanceObserver;
                });
                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                metrics(options);
            });

            it('should create a new PerformanceObserver', () => {
                subscribe(observer);

                expect(window.PerformanceObserver).to.have.been.calledOnce;

                expect(window.PerformanceObserver.firstCall.args.length).to.equal(1);
                expect(window.PerformanceObserver.firstCall.args[0]).to.be.a('function');
            });

            it('should call observe() with the given options object', () => {
                subscribe(observer);

                expect(performanceObserver.observe).to.have.been.calledOnce.and.calledWithExactly(options);
            });

            it('should call error() with an error thrown by observe()', () => {
                const err = new Error('a fake error');

                performanceObserver.observe.throws(err);

                subscribe(observer);

                expect(observer.error).to.have.been.calledOnce.and.calledWithExactly(err);
            });

            it('should call next() with the current metrics on each invocation of the callback', () => {
                subscribe(observer);

                const entries = ['a', 'fake', 'array', 'of', 'metrics'];
                const entryList = { getEntries: () => entries };

                callback(entryList);

                expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(entries);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let performanceObserver;
            let unsubscribe;

            beforeEach(() => {
                performanceObserver = { disconnect: spy(), observe: spy() };

                window.PerformanceObserver.returns(performanceObserver);
                wrapSubscribeFunction.callsFake((subscribe) => (unsubscribe = subscribe()));

                metrics({});
            });

            it('should call disonnect()', () => {
                unsubscribe();

                expect(performanceObserver.disconnect).to.have.been.calledOnce.and.calledWithExactly();
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
