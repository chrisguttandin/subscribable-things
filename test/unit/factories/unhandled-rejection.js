import { spy, stub } from 'sinon';
import { createUnhandledRejection } from '../../../src/factories/unhandled-rejection';

describe('unhandledRejection()', () => {
    let emitNotSupportedError;
    let unhandledRejection;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = stub();
        wrapSubscribeFunction = stub();
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

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(unhandledRejection(100)).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                unhandledRejection(100);
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
            window = { addEventListener: stub(), clearInterval: spy(), removeEventListener: spy(), setInterval: stub() };

            unhandledRejection = createUnhandledRejection(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            unhandledRejection(100);

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

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
                observer = { error: spy(), next: spy() };

                window.addEventListener.callsFake((type, value) => {
                    if (type === 'rejectionhandled') {
                        rejectionHandledEventListener = value;
                    } else {
                        unhandledRejectionEventListener = value;
                    }
                });
                window.setInterval.callsFake((...args) => {
                    intervalId = setInterval(...args);

                    return intervalId;
                });
                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                unhandledRejection(coolingOffPeriod);
            });

            it('should register a rejectionhandled event listener', () => {
                subscribe(observer);

                expect(window.addEventListener).to.have.been.calledTwice.and.calledWithExactly(
                    'rejectionhandled',
                    rejectionHandledEventListener
                );
            });

            it('should register an unhandledrejection event listener', () => {
                subscribe(observer);

                expect(window.addEventListener).to.have.been.calledTwice.and.calledWithExactly(
                    'unhandledrejection',
                    unhandledRejectionEventListener
                );
            });

            it('should call preventDefault() on each unhandledrejection event', () => {
                subscribe(observer);

                const preventDefault = spy();

                unhandledRejectionEventListener({ preventDefault });

                expect(preventDefault).to.have.been.calledOnce;
            });

            it('should call setInterval() on the first unhandledrejection event', () => {
                subscribe(observer);

                unhandledRejectionEventListener({ preventDefault() {} });

                expect(window.setInterval).to.have.been.calledOnce;

                expect(window.setInterval.firstCall.args.length).to.equal(2);
                expect(window.setInterval.firstCall.args[0]).to.be.a('function');
                expect(window.setInterval.firstCall.args[1]).to.equal(coolingOffPeriod / 2);
            });

            it('should not call setInterval() on consecutive unhandledrejection events', () => {
                subscribe(observer);

                unhandledRejectionEventListener({ preventDefault() {} });

                window.setInterval.resetHistory();

                unhandledRejectionEventListener({ preventDefault() {} });

                expect(window.setInterval).to.have.not.been.called;
            });

            it('should call next() with the reason when the cooling period did elapse', (done) => {
                subscribe(observer);

                const reason = 'a fake reason';

                unhandledRejectionEventListener({ preventDefault() {}, reason });

                expect(observer.next).to.have.not.been.called;

                setTimeout(() => {
                    expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(reason);

                    done();
                }, coolingOffPeriod * 2);
            });

            it('should not call next() with the reason if the rejectionhandled did fire before the cooling period did elapse', (done) => {
                subscribe(observer);

                const reason = 'a fake reason';

                unhandledRejectionEventListener({ preventDefault() {}, reason });
                rejectionHandledEventListener({ reason });

                setTimeout(() => {
                    expect(observer.next).to.have.not.been.called;

                    done();
                }, coolingOffPeriod * 2);
            });

            it('should call clearInterval() when there is no remaining possibly unhandled rejection', (done) => {
                subscribe(observer);

                const reason = 'a fake reason';

                unhandledRejectionEventListener({ preventDefault() {}, reason });
                rejectionHandledEventListener({ reason });

                setTimeout(() => {
                    expect(window.clearInterval).to.have.been.calledOnce.and.calledWithExactly(intervalId);

                    done();
                }, coolingOffPeriod * 2);
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

                window.addEventListener.callsFake((type, value) => {
                    if (type === 'rejectionhandled') {
                        rejectionHandledEventListener = value;
                    } else {
                        unhandledRejectionEventListener = value;
                    }
                });
                window.setInterval.returns(intervalId);
                wrapSubscribeFunction.callsFake((subscribe) => (unsubscribe = subscribe({ next() {} })));

                unhandledRejection(100);
            });

            it('should not call clearInterval()', () => {
                unsubscribe();

                expect(window.clearInterval).to.have.not.been.called;
            });

            it('should call clearInterval()', () => {
                unhandledRejectionEventListener({ preventDefault() {} });

                unsubscribe();

                expect(window.clearInterval).to.have.been.calledOnce.and.calledWithExactly(intervalId);
            });

            it('should remove the rejectionhandled event listener', () => {
                unsubscribe();

                expect(window.removeEventListener).to.have.been.calledTwice.and.calledWithExactly(
                    'rejectionhandled',
                    rejectionHandledEventListener
                );
            });

            it('should remove the unhandledrejection event listener', () => {
                unsubscribe();

                expect(window.removeEventListener).to.have.been.calledTwice.and.calledWithExactly(
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
