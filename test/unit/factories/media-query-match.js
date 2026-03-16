import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMediaQueryMatch } from '../../../src/factories/media-query-match';

describe('mediaQueryMatch()', () => {
    let emitNotSupportedError;
    let mediaQueryMatch;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = vi.fn();
        wrapSubscribeFunction = vi.fn();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            mediaQueryMatch = createMediaQueryMatch(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            mediaQueryMatch('(max-width:600px)');

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(mediaQueryMatch('(max-width:600px)')).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                mediaQueryMatch('(max-width:600px)');
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
            window = { matchMedia: vi.fn() };

            mediaQueryMatch = createMediaQueryMatch(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            mediaQueryMatch('(max-width:600px)');

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(mediaQueryMatch('(max-width:600px)')).to.equal(value);
        });

        describe('subscribe()', () => {
            let mediaQueryList;
            let mediaQueryString;
            let observer;
            let subscribe;

            beforeEach(() => {
                mediaQueryList = { matches: true };
                mediaQueryString = '(max-width:600px)';
                observer = { next: vi.fn() };

                window.matchMedia.mockReturnValue(mediaQueryList);
                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                mediaQueryMatch(mediaQueryString);
            });

            it('should call matchMedia() with the given mediaQueryString', () => {
                subscribe(observer);

                expect(window.matchMedia).to.have.been.calledOnce.and.calledWith(mediaQueryString);
            });

            it('should call next() with the value of mediaQueryList.matches right away', () => {
                subscribe(observer);

                expect(observer.next).to.have.been.calledOnce.and.calledWith(mediaQueryList.matches);
            });

            it('should call next() with the value of mediaQueryList.matches on each change event', () => {
                subscribe(observer);

                observer.next.mockClear();

                mediaQueryList.matches = false;
                mediaQueryList.onchange();

                expect(observer.next).to.have.been.calledOnce.and.calledWith(mediaQueryList.matches);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let mediaQueryList;
            let unsubscribe;

            beforeEach(() => {
                mediaQueryList = { matches: true };

                window.matchMedia.mockReturnValue(mediaQueryList);
                wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe({ next() {} })));

                mediaQueryMatch('(max-width:600px)');
            });

            it('should remove the change event listener', () => {
                unsubscribe();

                expect(mediaQueryList.onchange).to.be.null;
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
