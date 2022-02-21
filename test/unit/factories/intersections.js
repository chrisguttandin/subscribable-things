import { spy, stub } from 'sinon';
import { createIntersections } from '../../../src/factories/intersections';

describe('intersections()', () => {
    let emitNotSupportedError;
    let intersections;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = stub();
        wrapSubscribeFunction = stub();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            intersections = createIntersections(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            intersections('a fake HTML element');

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(intersections('a fake HTML element')).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                intersections('a fake HTML element');
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
            window = { IntersectionObserver: stub() };

            intersections = createIntersections(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            intersections('a fake HTML element');

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(intersections('a fake HTML element')).to.equal(value);
        });

        describe('subscribe()', () => {
            let callback;
            let htmlElement;
            let intersectionObserver;
            let observer;
            let options;
            let subscribe;

            beforeEach(() => {
                htmlElement = 'a fake HTML element';
                intersectionObserver = { observe: spy() };
                observer = { error: spy(), next: spy() };
                options = { a: 'fake', options: 'object' };

                window.IntersectionObserver.callsFake((value) => {
                    callback = value;

                    return intersectionObserver;
                });
                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                intersections(htmlElement, options);
            });

            it('should create a new IntersectionObserver with the given options object', () => {
                subscribe(observer);

                expect(window.IntersectionObserver).to.have.been.calledOnce;

                expect(window.IntersectionObserver.firstCall.args.length).to.equal(2);
                expect(window.IntersectionObserver.firstCall.args[0]).to.be.a('function');
                expect(window.IntersectionObserver.firstCall.args[1]).to.equal(options);
            });

            it('should call observe() with the given htmlElement', () => {
                subscribe(observer);

                expect(intersectionObserver.observe).to.have.been.calledOnce.and.calledWithExactly(htmlElement);
            });

            it('should call next() with the current intersections on each invocation of the callback', () => {
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
            let intersectionObserver;
            let unsubscribe;

            beforeEach(() => {
                intersectionObserver = { disconnect: spy(), observe: spy() };

                window.IntersectionObserver.returns(intersectionObserver);
                wrapSubscribeFunction.callsFake((subscribe) => (unsubscribe = subscribe()));

                intersections('a fake HTML element');
            });

            it('should call disconnect()', () => {
                unsubscribe();

                expect(intersectionObserver.disconnect).to.have.been.calledOnce.and.calledWithExactly();
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
