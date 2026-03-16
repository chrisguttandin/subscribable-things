import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOn } from '../../../src/factories/on';

describe('on()', () => {
    let on;
    let wrapSubscribeFunction;

    beforeEach(() => {
        wrapSubscribeFunction = vi.fn();

        on = createOn(wrapSubscribeFunction);
    });

    it('should call wrapSubscribeFunction()', () => {
        on('a fake EventTarget', 'a fake event type');

        expect(wrapSubscribeFunction).to.have.been.calledOnce;
        expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
    });

    it('should return the value returned by wrapSubscribeFunction()', () => {
        const value = 'a fake return value';

        wrapSubscribeFunction.mockReturnValue(value);

        expect(on('a fake EventTarget', 'a fake event type')).to.equal(value);
    });

    describe('subscribe()', () => {
        let eventListener;
        let eventTarget;
        let eventType;
        let observer;
        let options;
        let subscribe;

        beforeEach(() => {
            eventTarget = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
            eventType = 'a fake event type';
            observer = { next: vi.fn() };
            options = { a: 'fake', options: 'object' };

            eventTarget.addEventListener.mockImplementation((_, value) => {
                eventListener = value;
            });
            wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

            on(eventTarget, eventType, options);
        });

        it('should register an event listener', () => {
            subscribe(observer);

            expect(eventTarget.addEventListener).to.have.been.calledOnce.and.calledWith(eventType, eventListener, options);
        });

        it('should call next() with the event on each event', () => {
            subscribe(observer);

            const event = 'a fake event';

            eventListener(event);

            expect(observer.next).to.have.been.calledOnce.and.calledWith(event);
        });

        it('should return a function', () => {
            expect(subscribe(observer)).to.be.a('function');
        });
    });

    describe('unsubscribe()', () => {
        let eventListener;
        let eventTarget;
        let eventType;
        let options;
        let unsubscribe;

        beforeEach(() => {
            eventTarget = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
            eventType = 'a fake event type';
            options = { a: 'fake', options: 'object' };

            eventTarget.addEventListener.mockImplementation((_, value) => {
                eventListener = value;
            });
            wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe({ next() {} })));

            on(eventTarget, eventType, options);
        });

        it('should remove the event listener', () => {
            unsubscribe();

            expect(eventTarget.removeEventListener).to.have.been.calledOnce.and.calledWith(eventType, eventListener, options);
        });

        it('should return undefined', () => {
            expect(unsubscribe()).to.be.undefined;
        });
    });
});
