import { spy, stub } from 'sinon';
import { createWakeLock } from '../../../src/factories/wake-lock';

describe('wakeLock()', () => {
    let emitNotSupportedError;
    let wakeLock;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = stub();
        wrapSubscribeFunction = stub();
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

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(wakeLock('screen')).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                wakeLock('screen');
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
            window = { navigator: { wakeLock: { request: stub() } } };

            wakeLock = createWakeLock(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            wakeLock('screen');

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(wakeLock('screen')).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;
            let wakeLockSentinel;
            let wakeLockType;

            beforeEach(() => {
                observer = { error: spy(), next: spy() };
                wakeLockSentinel = {};
                wakeLockType = 'screen';

                window.navigator.wakeLock.request.resolves(wakeLockSentinel);
                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                wakeLock(wakeLockType);
            });

            it('should call request() with the given wakeLockType', () => {
                subscribe(observer);

                expect(window.navigator.wakeLock.request).to.have.been.calledOnce.and.calledWithExactly(wakeLockType);
            });

            it('should call next() with true when the promise is resolved', async () => {
                subscribe(observer);

                await Promise.resolve();

                expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(true);
            });

            it('should call error() with an error when the promise is rejected', async () => {
                const err = new Error('a fake error');

                window.navigator.wakeLock.request.rejects(err);

                subscribe(observer);

                await Promise.resolve();
                await Promise.resolve();

                expect(observer.error).to.have.been.calledOnce.and.calledWithExactly(err);
            });

            it('should call next() with false on each release event', async () => {
                subscribe(observer);

                await Promise.resolve();

                observer.next.resetHistory();

                wakeLockSentinel.onrelease();

                expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(false);
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

                window.navigator.wakeLock.request.resetHistory();

                wakeLockSentinel.onrelease();

                expect(window.navigator.wakeLock.request).to.have.been.calledOnce.and.calledWithExactly(wakeLockType);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let unsubscribe;
            let wakeLockSentinel;
            let wakeLockType;

            beforeEach(() => {
                wakeLockSentinel = { release: stub() };
                wakeLockType = 'screen';

                wakeLockSentinel.release.resolves();
                window.navigator.wakeLock.request.resolves(wakeLockSentinel);
                wrapSubscribeFunction.callsFake((subscribe) => (unsubscribe = subscribe({ next() {} })));

                wakeLock(wakeLockType);
            });

            it('should remove the release event listener', async () => {
                await Promise.resolve();

                unsubscribe();

                expect(wakeLockSentinel.onrelease).to.be.null;
            });

            it('should call release()', async () => {
                await Promise.resolve();

                unsubscribe();

                expect(wakeLockSentinel.release).to.have.been.calledOnce.and.calledWithExactly();
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
