import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emitNotSupportedError } from '../../../src/functions/emit-not-supported-error';

describe('emitNotSupportedError()', () => {
    let observer;

    beforeEach(() => {
        observer = { error: vi.fn() };
    });

    it('should call error() with an error', () => {
        emitNotSupportedError(observer);

        expect(observer.error).to.have.been.calledOnce;
        expect(observer.error).to.have.been.calledWith(expect.any(Error));
    });

    it('should return a function', () => {
        expect(emitNotSupportedError(observer)).to.be.a('function');
    });

    it('should return undefined', () => {
        expect(emitNotSupportedError(observer)()).to.be.undefined;
    });
});
