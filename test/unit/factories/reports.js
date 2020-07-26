import { spy, stub } from 'sinon';
import { createReports } from '../../../src/factories/reports';

describe('reports()', () => {
    let emitNotSupportedError;
    let reports;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = stub();
        wrapSubscribeFunction = stub();
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

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(reports()).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                reports();
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
            window = { ReportingObserver: stub() };

            reports = createReports(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            reports();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(reports()).to.equal(value);
        });

        describe('subscribe()', () => {
            let callback;
            let observer;
            let options;
            let reportingObserver;
            let subscribe;

            beforeEach(() => {
                observer = { error: spy(), next: spy() };
                options = { a: 'fake', options: 'object' };
                reportingObserver = { observe: spy() };

                window.ReportingObserver.callsFake((value) => {
                    callback = value;

                    return reportingObserver;
                });
                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                reports(options);
            });

            it('should create a new ReportingObserver with the given options object', () => {
                subscribe(observer);

                expect(window.ReportingObserver).to.have.been.calledOnce;

                expect(window.ReportingObserver.firstCall.args.length).to.equal(2);
                expect(window.ReportingObserver.firstCall.args[0]).to.be.a('function');
                expect(window.ReportingObserver.firstCall.args[1]).to.equal(options);
            });

            it('should call observe()', () => {
                subscribe(observer);

                expect(reportingObserver.observe).to.have.been.calledOnce.and.calledWithExactly();
            });

            it('should call next() with the current reports on each invocation of the callback', () => {
                subscribe(observer);

                const reportList = ['a', 'fake', 'list', 'of', 'reports'];

                callback(reportList);

                expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(reportList);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let reportingObserver;
            let unsubscribe;

            beforeEach(() => {
                reportingObserver = { disconnect: spy(), observe: spy() };

                window.ReportingObserver.returns(reportingObserver);
                wrapSubscribeFunction.callsFake((subscribe) => (unsubscribe = subscribe()));

                reports();
            });

            it('should call disonnect()', () => {
                unsubscribe();

                expect(reportingObserver.disconnect).to.have.been.calledOnce.and.calledWithExactly();
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
