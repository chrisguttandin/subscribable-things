// eslint-disable-next-line max-classes-per-file
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createResizes } from '../../../src/factories/resizes';

describe('resizes()', () => {
    let emitNotSupportedError;
    let resizes;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = vi.fn();
        wrapSubscribeFunction = vi.fn();
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
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(resizes('a fake HTML element')).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                resizes('a fake HTML element');
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
            window = { ResizeObserver: vi.fn() };

            resizes = createResizes(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            resizes('a fake HTML element');

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(resizes('a fake HTML element')).to.equal(value);
        });

        describe('subscribe()', () => {
            let htmlElement;
            let callback;
            let observe;
            let observer;
            let options;
            let subscribe;

            beforeEach(() => {
                htmlElement = 'a fake HTML element';
                observe = vi.fn();
                observer = { error: vi.fn(), next: vi.fn() };
                options = { a: 'fake', options: 'object' };

                window.ResizeObserver.mockImplementation(
                    class {
                        constructor(value) {
                            this.observe = observe;

                            callback = value;
                        }
                    }
                );
                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                resizes(htmlElement, options);
            });

            it('should create a new ResizeObserver', () => {
                subscribe(observer);

                expect(window.ResizeObserver).to.have.been.calledOnce;
                expect(window.ResizeObserver).to.have.been.calledWith(expect.any(Function));
            });

            it('should call observe() with the given htmlElement and options object', () => {
                subscribe(observer);

                expect(observe).to.have.been.calledOnce.and.calledWith(htmlElement, options);
            });

            it('should call next() with the current resizes on each invocation of the callback', () => {
                subscribe(observer);

                const entries = ['a', 'fake', 'array', 'of', 'entries'];

                callback(entries);

                expect(observer.next).to.have.been.calledOnce.and.calledWith(entries);
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

                window.ResizeObserver.mockImplementation(
                    class {
                        constructor() {
                            this.disconnect = disconnect;
                            this.observe = vi.fn();
                        }
                    }
                );
                wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe()));

                resizes('a fake HTML element');
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
