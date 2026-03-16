// eslint-disable-next-line max-classes-per-file
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMutations } from '../../../src/factories/mutations';

describe('mutations()', () => {
    let emitNotSupportedError;
    let mutations;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = vi.fn();
        wrapSubscribeFunction = vi.fn();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            mutations = createMutations(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            mutations('a fake HTML element', {});

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(mutations('a fake HTML element', {})).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                mutations('a fake HTML element', {});
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
            window = { MutationObserver: vi.fn() };

            mutations = createMutations(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            mutations('a fake HTML element', {});

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(mutations('a fake HTML element', {})).to.equal(value);
        });

        describe('subscribe()', () => {
            let htmlElement;
            let mutationCallback;
            let observe;
            let observer;
            let options;
            let subscribe;

            beforeEach(() => {
                htmlElement = 'a fake HTML element';
                observe = vi.fn();
                observer = { error: vi.fn(), next: vi.fn() };
                options = { a: 'fake', options: 'object' };

                window.MutationObserver.mockImplementation(
                    class {
                        constructor(value) {
                            this.observe = observe;

                            mutationCallback = value;
                        }
                    }
                );
                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                mutations(htmlElement, options);
            });

            it('should create a new MutationObserver', () => {
                subscribe(observer);

                expect(window.MutationObserver).to.have.been.calledOnce;
                expect(window.MutationObserver).to.have.been.calledWith(expect.any(Function));
            });

            it('should call observe() with the given htmlElement and options object', () => {
                subscribe(observer);

                expect(observe).to.have.been.calledOnce.and.calledWith(htmlElement, options);
            });

            it('should call error() with an error thrown by observe()', () => {
                const err = new Error('a fake error');

                observe.mockThrow(err);

                subscribe(observer);

                expect(observer.error).to.have.been.calledOnce.and.calledWith(err);
            });

            it('should call next() with the current records on each invocation of the mutation callback', () => {
                subscribe(observer);

                const records = ['a', 'fake', 'array', 'of', 'mutation', 'records'];

                mutationCallback(records);

                expect(observer.next).to.have.been.calledOnce.and.calledWith(records);
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

                window.MutationObserver.mockImplementation(
                    class {
                        constructor() {
                            this.disconnect = disconnect;
                            this.observe = vi.fn();
                        }
                    }
                );
                wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe()));

                mutations('a fake HTML element', {});
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
