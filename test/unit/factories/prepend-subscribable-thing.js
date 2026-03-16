import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPrependSubscribableThing } from '../../../src/factories/prepend-subscribable-thing';

describe('prependSubscribableThing()', () => {
    let prependSubscribableThing;
    let prependedValue;
    let subscribableThing;
    let wrapSubscribeFunction;

    beforeEach(() => {
        prependedValue = 'a fake prepended value';
        subscribableThing = vi.fn();
        wrapSubscribeFunction = vi.fn();

        prependSubscribableThing = createPrependSubscribableThing(wrapSubscribeFunction);
    });

    it('should call wrapSubscribeFunction()', () => {
        prependSubscribableThing(subscribableThing, prependedValue);

        expect(wrapSubscribeFunction).to.have.been.calledOnce;
        expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
    });

    it('should return the value returned by wrapSubscribeFunction()', () => {
        const value = 'a fake return value';

        wrapSubscribeFunction.mockReturnValue(value);

        expect(prependSubscribableThing(subscribableThing, prependedValue)).to.equal(value);
    });

    describe('subscribe()', () => {
        let observer;
        let subscribe;

        beforeEach(() => {
            observer = { next: vi.fn() };

            wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

            prependSubscribableThing(subscribableThing, prependedValue);
        });

        it('should call next() with the prepended value', () => {
            subscribe(observer);

            expect(observer.next).to.have.been.calledOnce.and.calledWith(prependedValue);
        });

        it('should call subscribableThing() with the given observer', () => {
            subscribe(observer);

            expect(subscribableThing).to.have.been.calledOnce.and.calledWith(observer);
        });

        it('should return the value returned by subscribableThing()', () => {
            const value = 'a fake return value';

            subscribableThing.mockReturnValue(value);

            expect(subscribe(observer)).to.equal(value);
        });
    });
});
