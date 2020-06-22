import { spy, stub } from 'sinon';
import { createResizes } from '../../../src/factories/resizes';

describe('resizes()', () => {
    let emitNotSupportedError;
    let resizes;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = stub();
        wrapSubscribeFunction = stub();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            resizes = createResizes(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            resizes('a fake HTML element');

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(resizes('a fake HTML element')).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                resizes('a fake HTML element');
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
            window = { ResizeObserver: stub() };

            resizes = createResizes(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            resizes('a fake HTML element');

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(resizes('a fake HTML element')).to.equal(value);
        });

        describe('subscribe()', () => {
            let htmlElement;
            let callback;
            let observer;
            let options;
            let resizeObserver;
            let subscribe;

            beforeEach(() => {
                htmlElement = 'a fake HTML element';
                observer = { error: spy(), next: spy() };
                options = { a: 'fake', options: 'object' };
                resizeObserver = { observe: spy() };

                window.ResizeObserver.callsFake((value) => {
                    callback = value;

                    return resizeObserver;
                });
                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                resizes(htmlElement, options);
            });

            it('should create a new ResizeObserver', () => {
                subscribe(observer);

                expect(window.ResizeObserver).to.have.been.calledOnce;
            });

            it('should call observe() with the given htmlElement and options object', () => {
                subscribe(observer);

                expect(resizeObserver.observe).to.have.been.calledOnce.and.calledWithExactly(htmlElement, options);
            });

            it('should call next() with the current resizes on each invocation of the callback', () => {
                subscribe(observer);

                const entries = ['a', 'fake', 'array', 'of', 'entries'];

                callback(entries);

                expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(entries);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let resizeObserver;
            let unsubscribe;

            beforeEach(() => {
                resizeObserver = { disconnect: spy(), observe: spy() };

                window.ResizeObserver.returns(resizeObserver);
                wrapSubscribeFunction.callsFake((subscribe) => (unsubscribe = subscribe()));

                resizes('a fake HTML element');
            });

            it('should call disonnect()', () => {
                unsubscribe();

                expect(resizeObserver.disconnect).to.have.been.calledOnce;
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
