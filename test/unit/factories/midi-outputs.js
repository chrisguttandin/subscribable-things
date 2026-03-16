import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMidiOutputs } from '../../../src/factories/midi-outputs';

describe('midiOutputs()', () => {
    let midiOutputs;
    let wrapSubscribeFunction;

    beforeEach(() => {
        wrapSubscribeFunction = vi.fn();

        midiOutputs = createMidiOutputs(wrapSubscribeFunction);
    });

    it('should call wrapSubscribeFunction()', () => {
        midiOutputs({ a: 'fake', midiAccess: 'object' });

        expect(wrapSubscribeFunction).to.have.been.calledOnce;
        expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
    });

    it('should return the value returned by wrapSubscribeFunction()', () => {
        const value = 'a fake return value';

        wrapSubscribeFunction.mockReturnValue(value);

        expect(midiOutputs({ a: 'fake', midiAccess: 'object' })).to.equal(value);
    });

    describe('subscribe()', () => {
        let eventListener;
        let midiAccess;
        let observer;
        let subscribe;

        beforeEach(() => {
            midiAccess = {
                addEventListener: vi.fn(),
                outputs: new Map([['a-fake-id', { a: 'fake midi output', id: 'a-fake-id' }]]),
                removeEventListener: vi.fn()
            };
            observer = { next: vi.fn() };

            midiAccess.addEventListener.mockImplementation((_, value) => (eventListener = value));
            wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

            midiOutputs(midiAccess);
        });

        it('should register a statechange event listener', () => {
            subscribe(observer);

            expect(midiAccess.addEventListener).to.have.been.calledOnce.and.calledWith('statechange', eventListener);
        });

        it('should call next() with the transformed value of midiAccess.outputs right away', () => {
            subscribe(observer);

            expect(observer.next).to.have.been.calledOnce.and.calledWith(Array.from(midiAccess.outputs.values()));
        });

        it('should call next() with the transformed value of midiAccess.outputs on each statechange event', () => {
            subscribe(observer);

            observer.next.mockClear();

            midiAccess.outputs = new Map([['another-fake-id', { another: 'fake midi output', id: 'another-fake-id' }]]);

            eventListener();

            expect(observer.next).to.have.been.calledOnce.and.calledWith(Array.from(midiAccess.outputs.values()));
        });

        it('should not call next() on a statechange event if the outputs remain the same', () => {
            subscribe(observer);

            observer.next.mockClear();

            midiAccess.outputs = new Map([['a-fake-id', { a: 'fake midi output', id: 'a-fake-id' }]]);

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
                outputs: new Map(),
                removeEventListener: vi.fn()
            };

            midiAccess.addEventListener.mockImplementation((_, value) => (eventListener = value));
            wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe({ next() {} })));

            midiOutputs(midiAccess);
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
