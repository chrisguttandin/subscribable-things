import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPermissionState } from '../../../src/factories/permission-state';

describe('permissionState()', () => {
    let emitNotSupportedError;
    let permissionState;
    let wrapSubscribeFunction;

    beforeEach(() => {
        emitNotSupportedError = vi.fn();
        wrapSubscribeFunction = vi.fn();
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
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(permissionState({ name: 'midi' })).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let subscribe;

            beforeEach(() => {
                observer = { a: 'fake', observer: 'object' };

                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                permissionState({ name: 'midi' });
            });

            it('should call emitNotSupportedError() with the given observer', () => {
                subscribe(observer);

                expect(emitNotSupportedError).to.have.been.calledOnce.and.calledWith(observer);
            });

            it('should return the value returned by emitNotSupportedError()', () => {
                const value = 'a fake return value';

                emitNotSupportedError.mockReturnValue(value);

                expect(subscribe(observer)).to.equal(value);
            });
        });
    });

    describe('with a window object', () => {
        let window;

        beforeEach(() => {
            window = { navigator: { permissions: { query: vi.fn() } } };

            permissionState = createPermissionState(emitNotSupportedError, window, wrapSubscribeFunction);
        });

        it('should call wrapSubscribeFunction()', () => {
            permissionState({ name: 'midi' });

            expect(wrapSubscribeFunction).to.have.been.calledOnce;
            expect(wrapSubscribeFunction).to.have.been.calledWith(expect.any(Function));
        });

        it('should return the value returned by wrapSubscribeFunction()', () => {
            const value = 'a fake return value';

            wrapSubscribeFunction.mockReturnValue(value);

            expect(permissionState({ name: 'midi' })).to.equal(value);
        });

        describe('subscribe()', () => {
            let observer;
            let permissionDescriptor;
            let permissionStatus;
            let subscribe;

            beforeEach(() => {
                observer = { error: vi.fn(), next: vi.fn() };
                permissionDescriptor = { name: 'midi' };
                permissionStatus = { state: 'granted' };

                window.navigator.permissions.query.mockResolvedValue(permissionStatus);
                wrapSubscribeFunction.mockImplementation((value) => (subscribe = value));

                permissionState(permissionDescriptor);
            });

            it('should call query() with the given permissionDescriptor', () => {
                subscribe(observer);

                expect(window.navigator.permissions.query).to.have.been.calledOnce.and.calledWith(permissionDescriptor);
            });

            it('should call next() with the value of permissionStatus.state when the promise is resolved', async () => {
                subscribe(observer);

                await Promise.resolve();

                expect(observer.next).to.have.been.calledOnce.and.calledWith(permissionStatus.state);
            });

            it('should call error() with an error when the promise is rejected', async () => {
                const err = new Error('a fake error');

                window.navigator.permissions.query.mockRejectedValue(err);

                subscribe(observer);

                await Promise.resolve();
                await Promise.resolve();

                expect(observer.error).to.have.been.calledOnce.and.calledWith(err);
            });

            it('should call next() with the value of permissionStatus.state on each change event', async () => {
                subscribe(observer);

                await Promise.resolve();

                observer.next.mockClear();

                permissionStatus.state = 'denied';
                permissionStatus.onchange();

                expect(observer.next).to.have.been.calledOnce.and.calledWith(permissionStatus.state);
            });

            it('should return a function', () => {
                expect(subscribe(observer)).to.be.a('function');
            });
        });

        describe('unsubscribe()', () => {
            let observer;
            let permissionStatus;
            let unsubscribe;

            beforeEach(() => {
                observer = { next: () => {} };
                permissionStatus = { state: true };

                window.navigator.permissions.query.mockResolvedValue(permissionStatus);
                wrapSubscribeFunction.mockImplementation((subscribe) => (unsubscribe = subscribe(observer)));
            });

            it('should not assign the change event listener when calling unsubscribe() right away', async () => {
                permissionState({ name: 'midi' });
                unsubscribe();

                await Promise.resolve();

                expect(permissionStatus.onchange).to.be.undefined;
            });

            it('should not assign the change event listener when calling unsubscribe() during the first emission', async () => {
                permissionState({ name: 'midi' });

                observer.next = () => unsubscribe();

                await Promise.resolve();

                expect(permissionStatus.onchange).to.be.undefined;
            });

            it('should remove the change event listener', async () => {
                permissionState({ name: 'midi' });

                await Promise.resolve();

                unsubscribe();

                expect(permissionStatus.onchange).to.be.null;
            });

            it('should return undefined', () => {
                permissionState({ name: 'midi' });

                expect(unsubscribe()).to.be.undefined;
            });
        });
    });
});
