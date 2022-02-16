import { spy, stub } from 'sinon';
import { createMapSubscribableThing } from '../../../src/factories/map-subscribable-thing';

describe('mapSubscribableThing()', () => {
    let mapSubscribableThing;
    let map;
    let subscribableThing;
    let wrapSubscribeFunction;

    beforeEach(() => {
        map = stub();
        subscribableThing = stub();
        wrapSubscribeFunction = stub();

        mapSubscribableThing = createMapSubscribableThing(wrapSubscribeFunction);
    });

    it('should call wrapSubscribeFunction()', () => {
        mapSubscribableThing(subscribableThing, map);

        expect(wrapSubscribeFunction).to.have.been.calledOnce;

        expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
        expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
    });

    it('should return the value returned by wrapSubscribeFunction()', () => {
        const value = 'a fake return value';

        wrapSubscribeFunction.returns(value);

        expect(mapSubscribableThing(subscribableThing, map)).to.equal(value);
    });

    describe('subscribe()', () => {
        let observer;
        let subscribe;

        beforeEach(() => {
            observer = { complete: 'a fake complete function', error: 'a fake error function', next: spy() };

            wrapSubscribeFunction.callsFake((value) => (subscribe = value));

            mapSubscribableThing(subscribableThing, map);
        });

        it('should call subscribableThing() with the given observer but with a replaced next function', () => {
            subscribe(observer);

            expect(subscribableThing).to.have.been.calledOnce;
            expect(subscribableThing.firstCall.args.length).to.equal(1);

            const arg = subscribableThing.firstCall.args[0];

            expect(arg.next).to.be.a('function');
            expect(arg.next).to.not.equal(observer.next);
            expect(arg).to.deep.equal({ ...observer, next: arg.next });
        });

        it('should return the value returned by subscribableThing()', () => {
            const value = 'a fake return value';

            subscribableThing.returns(value);

            expect(subscribe(observer)).to.equal(value);
        });

        describe('next()', () => {
            let next;

            beforeEach(() => {
                subscribableThing.callsFake((value) => (next = value.next));

                subscribe(observer);
            });

            it('should call map() with the given value', () => {
                const value = 'a fake value';

                next(value);

                expect(map).to.have.been.calledOnce.and.calledWithExactly(value);
            });

            it('should call next() with the mapped value', () => {
                const mappedValue = 'a fake mapped value';

                map.returns(mappedValue);

                next('a fake value');

                expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(mappedValue);
            });
        });
    });
});
