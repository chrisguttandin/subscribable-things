import { spy, stub } from 'sinon';
import { createAnimationFrame } from '../../../src/factories/animation-frame';

describe('animationFrame()', () => {
    let animationFrame;
    let emitNotSupportedError;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = stub();
        wrapSubscribeFunction = stub();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            animationFrame = createAnimationFrame(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            animationFrame();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(animationFrame()).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                animationFrame();
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
            window = { cancelAnimationFrame: stub(), requestAnimationFrame: stub() };

            animationFrame = createAnimationFrame(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            animationFrame();

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(animationFrame()).to.equal(value);
        });

        describe('subscribe()', () => {
            let animationFrameHandle;
            let callback;
            let observer;
            let subscribe;

            beforeEach(() => {
                animationFrameHandle = 'a fake animation frame handle';
                observer = { error: spy(), next: spy() };

                window.requestAnimationFrame.callsFake((value) => {
                    callback = value;

                    return animationFrameHandle;
                });
                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                animationFrame();
            });

            it('should request an animation frame', () => {
                subscribe(observer);

                expect(window.requestAnimationFrame).to.have.been.calledOnce;

                expect(window.requestAnimationFrame.firstCall.args.length).to.equal(1);
                expect(window.requestAnimationFrame.firstCall.args[0]).to.be.a('function');
            });

            it('should call next() with the given timestamp on each animation frame', () => {
                subscribe(observer);

                const timestamp = 'a fake timestamp';

                callback(timestamp);

                expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(timestamp);
            });

            it('should request another animation frame', () => {
                subscribe(observer);

                window.requestAnimationFrame.reset();

                callback('a fake timestamp'); // eslint-disable-line node/no-callback-literal

                expect(window.requestAnimationFrame).to.have.been.calledOnce;

                expect(window.requestAnimationFrame.firstCall.args.length).to.equal(1);
                expect(window.requestAnimationFrame.firstCall.args[0]).to.be.a('function');
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let animationFrameHandle;
            let unsubscribe;

            beforeEach(() => {
                animationFrameHandle = 'a fake animation frame handle';

                window.requestAnimationFrame.callsFake(() => animationFrameHandle);
                wrapSubscribeFunction.callsFake((subscribe) => (unsubscribe = subscribe()));

                animationFrame();
            });

            it('should cancel the requested animation frame', () => {
                unsubscribe();

                expect(window.cancelAnimationFrame).to.have.been.calledOnce.and.calledWithExactly(animationFrameHandle);
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
