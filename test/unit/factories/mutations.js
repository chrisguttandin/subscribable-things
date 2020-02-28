import { spy, stub } from 'sinon';
import { createMutations } from '../../../src/factories/mutations';

describe('muations()', () => {

    let muations;
    let window;
    let wrapSubscribeFunction;

    beforeEach(() => {
        window = { MutationObserver: stub() };
        wrapSubscribeFunction = stub();

        muations = createMutations(window, wrapSubscribeFunction);
    });

    it('should call wrapSubscribeFunction()', () => {
        muations('a fake HTML element', { });

        expect(wrapSubscribeFunction).to.have.been.calledOnce;

        expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
        expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
    });

    it('should return the value returned by wrapSubscribeFunction()', () => {
        const value = 'a fake return value';

        wrapSubscribeFunction.returns(value);

        expect(muations('a fake HTML element', { })).to.equal(value);
    });

    describe('subscribe()', () => {

        let htmlElement;
        let mutationCallback;
        let mutationObserver;
        let observer;
        let options;
        let subscribe;

        beforeEach(() => {
            htmlElement = 'a fake HTML element';
            mutationObserver = { observe: stub() };
            observer = { error: spy(), next: spy() };
            options = { a: 'fake', options: 'object' };

            window.MutationObserver.callsFake((value) => {
                mutationCallback = value;

                return mutationObserver;
            });
            wrapSubscribeFunction.callsFake((value) => subscribe = value);

            muations(htmlElement, options);
        });

        it('should create a new MutationObserver', () => {
            subscribe(observer);

            expect(window.MutationObserver).to.have.been.calledOnce;
        });

        it('should call observe() with the given htmlElement and options object', () => {
            subscribe(observer);

            expect(mutationObserver.observe).to.have.been.calledOnce.and.calledWithExactly(htmlElement, options);
        });

        it('should call error() with an error thrown by observe()', () => {
            const err = new Error('a fake error');

            mutationObserver.observe.throws(err);

            subscribe(observer);

            expect(observer.error).to.have.been.calledOnce.and.calledWithExactly(err);
        });

        it('should call next() with the current records on each invocation of the mutation callback', () => {
            subscribe(observer);

            const records = [ 'a', 'fake', 'array', 'of', 'mutation', 'records' ];

            mutationCallback(records);

            expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(records);
        });

        it('should return a function', () => {
            expect(subscribe(observer)).to.be.a('function');
        });

    });

    describe('unsubscribe()', () => {

        let mutationObserver;
        let unsubscribe;

        beforeEach(() => {
            mutationObserver = { disconnect: spy(), observe: spy() };

            window.MutationObserver.returns(mutationObserver);
            wrapSubscribeFunction.callsFake((subscribe) => unsubscribe = subscribe());

            muations('a fake HTML element');
        });

        it('should call disonnect()', () => {
            unsubscribe();

            expect(mutationObserver.disconnect).to.have.been.calledOnce;
        });

        it('should return undefined', () => {
            expect(unsubscribe()).to.be.undefined;
        });

    });

});
