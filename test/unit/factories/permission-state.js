import { spy, stub } from 'sinon';
import { createPermissionState } from '../../../src/factories/permission-state';

describe('permissionState()', () => {
    let emitNotSupportedError;
    let permissionState;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = stub();
        wrapSubscribeFunction = stub();
    });

    describe('without a window object', () => {
        let window;

        beforeEach(() => {
            window = null;

            permissionState = createPermissionState(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            permissionState({ name: 'midi' });

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(permissionState({ name: 'midi' })).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                permissionState({ name: 'midi' });
            });

            it('should call emitNotSupportedError() with the given observer', () => {
                subscribe(observer);

                expect(emitNotSupportedError).to.have.been.calledOnce.and.calledWithExactly(observer);
            });

            it('should return the value returned by emitNotSupportedError()', () => {
                const value = 'a fake return value';

                emitNotSupportedError.returns(value);

                expect(subscribe(observer)).to.equal(value);
            });
        });
    });

    describe('with a window object', () => {
        let window;

        beforeEach(() => {
            window = { navigator: { permissions: { query: stub() } } };

            permissionState = createPermissionState(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            permissionState({ name: 'midi' });

            expect(wrapSubscribeFunction).to.have.been.calledOnce;

            expect(wrapSubscribeFunction.firstCall.args.length).to.equal(1);
            expect(wrapSubscribeFunction.firstCall.args[0]).to.be.a('function');
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.returns(value);

            expect(permissionState({ name: 'midi' })).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let permissionDescriptor;
            let permissionStatus;
            let subscribe;

            beforeEach(() => {
                observer = { error: spy(), next: spy() };
                permissionDescriptor = { name: 'midi' };
                permissionStatus = { state: 'granted' };

                window.navigator.permissions.query.resolves(permissionStatus);
                wrapSubscribeFunction.callsFake((value) => (subscribe = value));

                permissionState(permissionDescriptor);
            });

            it('should call query() with the given permissionDescriptor', () => {
                subscribe(observer);

                expect(window.navigator.permissions.query).to.have.been.calledOnce.and.calledWithExactly(permissionDescriptor);
            });

            it('should call next() with the value of permissionStatus.state when the promise is resolved', async () => {
                subscribe(observer);

                await Promise.resolve();

                expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(permissionStatus.state);
            });

            it('should call error() with an error when the promise is rejected', async () => {
                const err = new Error('a fake error');

                window.navigator.permissions.query.rejects(err);

                subscribe(observer);

                await Promise.resolve();
                await Promise.resolve();

                expect(observer.error).to.have.been.calledOnce.and.calledWithExactly(err);
            });

            it('should call next() with the value of permissionStatus.state on each change event', async () => {
                subscribe(observer);

                await Promise.resolve();

                observer.next.resetHistory();

                permissionStatus.state = 'denied';
                permissionStatus.onchange();

                expect(observer.next).to.have.been.calledOnce.and.calledWithExactly(permissionStatus.state);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let permissionStatus;
            let unsubscribe;

            beforeEach(() => {
                permissionStatus = { state: true };

                window.navigator.permissions.query.resolves(permissionStatus);
                wrapSubscribeFunction.callsFake((subscribe) => (unsubscribe = subscribe({ next() {} })));

                permissionState({ name: 'midi' });
            });

            it('should not assign the change event listener', async () => {
                unsubscribe();

                await Promise.resolve();

                expect(permissionStatus.onchange).to.be.undefined;
            });

            it('should remove the change event listener', async () => {
                await Promise.resolve();

                unsubscribe();

                expect(permissionStatus.onchange).to.be.null;
            });

            it('should return undefined', () => {
                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
