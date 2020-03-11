import { spy, stub } from 'sinon';
import { createMediaDevices } from '../../../src/factories/media-devices';

describe('mediaDevices()', () => {

    let emitNotSupportedError;
    let mediaDevices;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = stub();
        wrapSubscribeFunction = stub();
    });

    describe('without a window object', () => {

        let window;

        beforeEach(() => {
            window = null;

            mediaDevices = createMediaDevices(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            mediaDevices();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(mediaDevices()).to.equal(value);
        });

        describe('subscribe()', () => {

            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.callsFake((value) => subscribe = value);

                mediaDevices();
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
            window = { navigator: { mediaDevices: { addEventListener: stub(), enumerateDevices: stub(), removeEventListener: spy() } } };

            mediaDevices = createMediaDevices(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            mediaDevices();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(mediaDevices()).to.equal(value);
        });

        describe('subscribe()', () => {

            let eventListener;
            let mediaDeviceInfos;
            let observer;
            let subscribe;

            beforeEach(() => {
                mediaDeviceInfos = [ 'a', 'fake', 'array', 'of', 'media', 'device', 'infos' ];
                observer = { error: spy(), next: spy() };

                window.navigator.mediaDevices.addEventListener.callsFake((_, value) => eventListener = value);
                window.navigator.mediaDevices.enumerateDevices.callsFake(() => Promise.resolve(mediaDeviceInfos));
                wrapSubscribeFunction.callsFake((value) => subscribe = value);

                mediaDevices();
            });

            it('should call enumerateDevices()', () => {
                subscribe(observer);

                expect(window.navigator.mediaDevices.enumerateDevices).to.have.been.calledOnce;
            });

            it('should register a devicechange event listener', () => {
                subscribe(observer);

                expect(window.navigator.mediaDevices.addEventListener).to.have.been.calledOnce.and.calledWithExactly('devicechange', eventListener);
            });

            it('should call next() with the mediaDeviceInfos when the promise is resolved', async () => {
                subscribe(observer);

                await Promise.resolve();

                expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(mediaDeviceInfos);
            });

            it('should call error() with an error when the promise is rejected', async () => {
                const err = new Error('a fake error');

                window.navigator.mediaDevices.enumerateDevices.rejects(err);

                subscribe(observer);

                await Promise.resolve();
                await Promise.resolve();

                expect(observer.error).to.have.been.calledOnce.and.calledWithExactly(err);
            });

            it('should remove the event listener when the promise is rejected', async () => {
                const err = new Error('a fake error');

                window.navigator.mediaDevices.enumerateDevices.rejects(err);

                subscribe(observer);

                await Promise.resolve();
                await Promise.resolve();

                expect(window.navigator.mediaDevices.removeEventListener).to.have.been.calledOnce.and.calledWithExactly('devicechange', eventListener);
            });

            it('should call enumerateDevices() on each devicechange event', async () => {
                subscribe(observer);

                await Promise.resolve();

                window.navigator.mediaDevices.enumerateDevices.resetHistory();

                eventListener();

                expect(window.navigator.mediaDevices.enumerateDevices).to.have.been.calledOnce;
            });

            it('should call next() with the mediaDeviceInfos on each devicechange event when the promise is resolved', async () => {
                subscribe(observer);

                await Promise.resolve();

                observer.next.resetHistory();

                mediaDeviceInfos = [ 'another', 'fake', 'array', 'of', 'media', 'device', 'infos' ];

                eventListener();

                await Promise.resolve();

                expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(mediaDeviceInfos);
            });

            it('should call error() with an error on each devicechange event when the promise is rejected', async () => {
                const err = new Error('a fake error');

                subscribe(observer);

                await Promise.resolve();

                observer.next.resetHistory();

                window.navigator.mediaDevices.enumerateDevices.rejects(err);

                eventListener();

                await Promise.resolve();
                await Promise.resolve();

                expect(observer.error).to.have.been.calledOnce.and.calledWithExactly(err);
            });

            it('should remove the event listener on each devicechange event when the promise is rejected', async () => {
                const err = new Error('a fake error');

                subscribe(observer);

                await Promise.resolve();

                observer.next.resetHistory();

                window.navigator.mediaDevices.enumerateDevices.rejects(err);

                eventListener();

                await Promise.resolve();
                await Promise.resolve();

                expect(window.navigator.mediaDevices.removeEventListener).to.have.been.calledOnce.and.calledWithExactly('devicechange', eventListener);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });

        });

        describe('unsubscribe()', () => {

            let eventListener;
            let mediaDeviceInfos;
            let unsubscribe;

            beforeEach(() => {
                mediaDeviceInfos = [ 'a', 'fake', 'array', 'of', 'media', 'device', 'infos' ];

                window.navigator.mediaDevices.addEventListener.callsFake((_, value) => eventListener = value);
                window.navigator.mediaDevices.enumerateDevices.resolves(mediaDeviceInfos);
                wrapSubscribeFunction.callsFake((subscribe) => unsubscribe = subscribe({ next () { } }));

                mediaDevices();
            });

            it('should remove the devicechange event listener', () => {
                unsubscribe();

                expect(window.navigator.mediaDevices.removeEventListener).to.have.been.calledOnce.and.calledWithExactly('devicechange', eventListener);
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });

        });

    });

});
