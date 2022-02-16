import { spy, stub } from 'sinon';
import { createPrependSubscribableThing } from '../../../src/factories/prepend-subscribable-thing';

describe('prependSubscribableThing()', () => {
    let prependSubscribableThing;
    let prependedValue;
    let subscribableThing;
    let wrapSubscribeFunction;

    beforeEach(() => {
        prependedValue = 'a fake prepended value';
        subscribableThing = stub();
        wrapSubscribeFunction = stub();

        prependSubscribableThing = createPrependSubscribableThing(wrapSubscribeFunction);
    });

    it('should call wrapSubscribeFunction()', () => {
        prependSubscribableThing(subscribableThing, prependedValue);

        expect(wrapSubscribeFunction).to.have.been.calledOnce;

        expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
        expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
    });

    it('should return the value returned by wrapSubscribeFunction()', () => {
        const value = 'a fake return value';

        wrapSubscribeFunction.returns(value);

        expect(prependSubscribableThing(subscribableThing, prependedValue)).to.equal(value);
    });

    describe('subscribe()', () => {
        let observer;
        let subscribe;

        beforeEach(() => {
            observer = { next: spy() };

            wrapSubscribeFunction.callsFake((value) => (subscribe = value));

            prependSubscribableThing(subscribableThing, prependedValue);
        });

        it('should call next() with the prepended value', () => {
            subscribe(observer);

            expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(prependedValue);
        });

        it('should call subscribableThing() with the given observer', () => {
            subscribe(observer);

            expect(subscribableThing).to.have.been.calledOnce.and.calledWithExactly(observer);
        });

        it('should return the value returned by subscribableThing()', () => {
            const value = 'a fake return value';

            subscribableThing.returns(value);

            expect(subscribe(observer)).to.equal(value);
        });
    });
});
