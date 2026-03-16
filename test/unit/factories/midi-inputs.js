import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMidiInputs } from '../../../src/factories/midi-inputs';

describe('midiInputs()', () => {
    let midiInputs;
    let wrapSubscribeFunction;

    beforeEach(() => {
        wrapSubscribeFunction = vi.fn();

        midiInputs = createMidiInputs(wrapSubscribeFunction);
    });

    it('should call wrapSubscribeFunction()', () => {
        midiInputs({ a: 'fake', midiAccess: 'object' });

        expect(wrapSubscribeFunction).to.have.been.calledOnce;
        expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
    });

    it('should return the value returned by wrapSubscribeFunction()', () => {
        const value = 'a fake return value';

        wrapSubscribeFunction.mockReturnValue(value);

        expect(midiInputs({ a: 'fake', midiAccess: 'object' })).to.equal(value);
    });

    describe('subscribe()', () => {
        let eventListener;
        let midiAccess;
        let observer;
        let subscribe;

        beforeEach(() => {
            midiAccess = {
                addEventListener: vi.fn(),
                inputs: new Map([['a-fake-id', { a: 'fake midi input', id: 'a-fake-id' }]]),
                removeEventListener: vi.fn()
            };
            observer = { next: vi.fn() };

            midiAccess.addEventListener.mockImplementation((_, value) => (eventListener = value));
            wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

            midiInputs(midiAccess);
        });

        it('should register a statechange event listener', () => {
            subscribe(observer);

            expect(midiAccess.addEventListener).to.have.been.calledOnce.and.calledWith('statechange', eventListener);
        });

        it('should call next() with the transformed value of midiAccess.inputs right away', () => {
            subscribe(observer);

            expect(observer.next).to.have.been.calledOnce.and.calledWith(Array.from(midiAccess.inputs.values()));
        });

        it('should call next() with the transformed value of midiAccess.inputs on each statechange event', () => {
            subscribe(observer);

            observer.next.mockClear();

            midiAccess.inputs = new Map([['another-fake-id', { another: 'fake midi input', id: 'another-fake-id' }]]);

            eventListener();

            expect(observer.next).to.have.been.calledOnce.and.calledWith(Array.from(midiAccess.inputs.values()));
        });

        it('should not call next() on a statechange event if the inputs remain the same', () => {
            subscribe(observer);

            observer.next.mockClear();

            midiAccess.inputs = new Map([['a-fake-id', { a: 'fake midi input', id: 'a-fake-id' }]]);

            eventListener();

            expect(observer.next).to.have.not.been.called;
        });

        it('should return a function', () => {
            expect(subscribe(observer)).to.be.a('function');
        });
    });

    describe('unsubscribe()', () => {
        let eventListener;
        let midiAccess;
        let unsubscribe;

        beforeEach(() => {
            midiAccess = {
                addEventListener: vi.fn(),
                inputs: new Map(),
                removeEventListener: vi.fn()
            };

            midiAccess.addEventListener.mockImplementation((_, value) => (eventListener = value));
            wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe({ next() {} })));

            midiInputs(midiAccess);
        });

        it('should remove the statechange event listener', () => {
            unsubscribe();

            expect(midiAccess.removeEventListener).to.have.been.calledOnce.and.calledWith('statechange', eventListener);
        });

        it('should return undefined', () => {
            expect(unsubscribe()).to.be.undefined;
        });
    });
});
