import { spy, stub } from 'sinon';
import { createMidiOutputs } from '../../../src/factories/midi-outputs';

describe('midiOutputs()', () => {

    let midiOutputs;
    let wrapSubscribeFunction;

    beforeEach(() => {
        wrapSubscribeFunction = stub();

        midiOutputs = createMidiOutputs(wrapSubscribeFunction);
    });

    it('should call wrapSubscribeFunction()', () => {
        midiOutputs({ a: 'fake', midiAccess: 'object' });

        expect(wrapSubscribeFunction).to.have.been.calledOnce;

        expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
        expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
    });

    it('should return the value returned by wrapSubscribeFunction()', () => {
        const value = 'a fake return value';

        wrapSubscribeFunction.returns(value);

        expect(midiOutputs({ a: 'fake', midiAccess: 'object' })).to.equal(value);
    });

    describe('subscribe()', () => {

        let eventListener;
        let midiAccess;
        let observer;
        let subscribe;

        beforeEach(() => {
            midiAccess = {
                addEventListener: stub(),
                outputs: new Map([ [ 'a-fake-id', { a: 'fake midi output', id: 'a-fake-id' } ] ]),
                removeEventListener: spy()
            };
            observer = { next: spy() };

            midiAccess.addEventListener.callsFake((_, value) => eventListener = value);
            wrapSubscribeFunction.callsFake((value) => subscribe = value);

            midiOutputs(midiAccess);
        });

        it('should register a statechange event listener', () => {
            subscribe(observer);

            expect(midiAccess.addEventListener).to.have.been.calledOnce.and.calledWithExactly('statechange', eventListener);
        });

        it('should call next() with the transformed value of midiAccess.outputs right away', () => {
            subscribe(observer);

            expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(Array.from(midiAccess.outputs.values()));
        });

        it('should call next() with the transformed value of midiAccess.outputs on each statechange event', () => {
            subscribe(observer);

            observer.next.resetHistory();

            midiAccess.outputs = new Map([ [ 'another-fake-id', { another: 'fake midi output', id: 'another-fake-id' } ] ]);

            eventListener();

            expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(Array.from(midiAccess.outputs.values()));
        });

        it('should not call next() on a statechange event if the outputs remain the same', () => {
            subscribe(observer);

            observer.next.resetHistory();

            midiAccess.outputs = new Map([ [ 'a-fake-id', { a: 'fake midi output', id: 'a-fake-id' } ] ]);

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
                addEventListener: stub(),
                outputs: new Map(),
                removeEventListener: spy()
            };

            midiAccess.addEventListener.callsFake((_, value) => eventListener = value);
            wrapSubscribeFunction.callsFake((subscribe) => unsubscribe = subscribe({ next () { } }));

            midiOutputs(midiAccess);
        });

        it('should remove the statechange event listener', () => {
            unsubscribe();

            expect(midiAccess.removeEventListener).to.have.been.calledOnce.and.calledWithExactly('statechange', eventListener);
        });

        it('should return undefined', () => {
            expect(unsubscribe()).to.be.undefined;
        });

    });

});
