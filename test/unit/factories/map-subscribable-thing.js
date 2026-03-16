import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMapSubscribableThing } from '../../../src/factories/map-subscribable-thing';

describe('mapSubscribableThing()', () => {
    let mapSubscribableThing;
    let map;
    let subscribableThing;
    let wrapSubscribeFunction;

    beforeEach(() => {
        map = vi.fn();
        subscribableThing = vi.fn();
        wrapSubscribeFunction = vi.fn();

        mapSubscribableThing = createMapSubscribableThing(wrapSubscribeFunction);
    });

    it('should call wrapSubscribeFunction()', () => {
        mapSubscribableThing(subscribableThing, map);

        expect(wrapSubscribeFunction).to.have.been.calledOnce;
        expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
    });

    it('should return the value returned by wrapSubscribeFunction()', () => {
        const value = 'a fake return value';

        wrapSubscribeFunction.mockReturnValue(value);

        expect(mapSubscribableThing(subscribableThing, map)).to.equal(value);
    });

    describe('subscribe()', () => {
        let observer;
        let subscribe;

        beforeEach(() => {
            observer = { complete: 'a fake complete function', error: 'a fake error function', next: vi.fn() };

            wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

            mapSubscribableThing(subscribableThing, map);
        });

        it('should call subscribableThing() with the given observer but with a replaced next function', () => {
            subscribe(observer);

            expect(subscribableThing).to.have.been.calledOnce;
            expect(subscribableThing).to.have.been.calledWith(expect.any(Object));

            const [arg] = subscribableThing.mock.calls[0];

            expect(arg.next).to.be.a('function');
            expect(arg.next).to.not.equal(observer.next);
            expect(arg).to.deep.equal({ ...observer, next: arg.next });
        });

        it('should return the value returned by subscribableThing()', () => {
            const value = 'a fake return value';

            subscribableThing.mockReturnValue(value);

            expect(subscribe(observer)).to.equal(value);
        });

        describe('next()', () => {
            let next;

            beforeEach(() => {
                subscribableThing.mockImplementation((value) => (next = value.next));

                subscribe(observer);
            });

            it('should call map() with the given value', () => {
                const value = 'a fake value';

                next(value);

                expect(map).to.have.been.calledOnce.and.calledWith(value);
            });

            it('should call next() with the mapped value', () => {
                const mappedValue = 'a fake mapped value';

                map.mockReturnValue(mappedValue);

                next('a fake value');

                expect(observer.next).to.have.been.calledOnce.and.calledWith(mappedValue);
            });
        });
    });
});
