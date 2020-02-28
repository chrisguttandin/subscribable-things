import { spy, stub } from 'sinon';
import { createMediaQueryMatches } from '../../../src/factories/media-query-matches';

describe('msediaQueryMatches()', () => {

    let mediaQueryMatches;
    let window;
    let wrapSubscribeFunction;

    beforeEach(() => {
        window = { matchMedia: stub() };
        wrapSubscribeFunction = stub();

        mediaQueryMatches = createMediaQueryMatches(window, wrapSubscribeFunction);
    });

    it('should call wrapSubscribeFunction()', () => {
        mediaQueryMatches('(max-width:600px)');

        expect(wrapSubscribeFunction).to.have.been.calledOnce;

        expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
        expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
    });

    it('should return the value returned by wrapSubscribeFunction()', () => {
        const value = 'a fake return value';

        wrapSubscribeFunction.returns(value);

        expect(mediaQueryMatches('(max-width:600px)')).to.equal(value);
    });

    describe('subscribe()', () => {

        let mediaQueryList;
        let mediaQueryString;
        let observer;
        let subscribe;

        beforeEach(() => {
            mediaQueryList = { matches: true };
            mediaQueryString = '(max-width:600px)';
            observer = { next: spy() };

            window.matchMedia.returns(mediaQueryList);
            wrapSubscribeFunction.callsFake((value) => subscribe = value);

            mediaQueryMatches(mediaQueryString);
        });

        it('should call matchMedia() with the given mediaQueryString', () => {
            subscribe(observer);

            expect(window.matchMedia).to.have.been.calledOnce.and.calledWithExactly(mediaQueryString);
        });

        it('should call next() with the value of mediaQueryList.matches right away', () => {
            subscribe(observer);

            expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(mediaQueryList.matches);
        });

        it('should call next() with the value of mediaQueryList.matches on each change event', () => {
            subscribe(observer);

            observer.next.resetHistory();

            mediaQueryList.matches = false;
            mediaQueryList.onchange();

            expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(mediaQueryList.matches);
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

            window.matchMedia.returns(mediaQueryList);
            wrapSubscribeFunction.callsFake((subscribe) => unsubscribe = subscribe({ next () { } }));

            mediaQueryMatches('(max-width:600px)');
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
