import { spy, stub } from 'sinon';
import { createGeolocation } from '../../../src/factories/geolocation';

describe('geolocation()', () => {
    let emitNotSupportedError;
    let geolocation;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = stub();
        wrapSubscribeFunction = stub();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            geolocation = createGeolocation(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            geolocation();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(geolocation()).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                geolocation();
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
            window = { navigator: { geolocation: { clearWatch: stub(), watchPosition: stub() } } };

            geolocation = createGeolocation(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            geolocation();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(geolocation()).to.equal(value);
        });

        describe('subscribe()', () => {
            let errorCallback;
            let observer;
            let options;
            let subscribe;
            let successCallback;

            beforeEach(() => {
                observer = { error: spy(), next: spy() };
                options = { a: 'fake', options: 'object' };

                window.navigator.geolocation.watchPosition.callsFake((...args) => ([successCallback, errorCallback] = args));
                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                geolocation(options);
            });

            it('should call watchPosition()', () => {
                subscribe(observer);

                expect(window.navigator.geolocation.watchPosition).to.have.been.calledOnce.and.calledWithExactly(
                    successCallback,
                    errorCallback,
                    options
                );
            });

            it('should call next() with the position when the successCallback gets called', () => {
                const postion = 'a fake geolocation position';

                subscribe(observer);
                successCallback(postion);

                expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(postion);
            });

            it('should call error() with an error when the errorCallback gets called', () => {
                const err = new Error('a fake error');

                subscribe(observer);
                errorCallback(err);

                expect(observer.error).to.have.been.calledOnce.and.calledWithExactly(err);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let unsubscribe;
            let watchId;

            beforeEach(() => {
                watchId = 'a fake watchId';

                window.navigator.geolocation.watchPosition.returns(watchId);
                wrapSubscribeFunction.callsFake((subscribe) => (unsubscribe = subscribe({ next() {} })));

                geolocation();
            });

            it('should call clearWatch()', () => {
                unsubscribe();

                expect(window.navigator.geolocation.clearWatch).to.have.been.calledOnce.and.calledWithExactly(watchId);
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
