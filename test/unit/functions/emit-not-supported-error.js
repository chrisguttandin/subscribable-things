import { emitNotSupportedError } from '../../../src/functions/emit-not-supported-error';
import { spy } from 'sinon';

describe('emitNotSupportedError()', () => {

    let observer;

    beforeEach(() => {
        observer = { error: spy() };
    });

    it('should call error() with an error', () => {
        emitNotSupportedError(observer);

        expect(observer.error).to.have.been.calledOnce;
        expect(observer.error.firstCall.args[0]).to.be.an.instanceOf(Error);
    });

    it('should return a function', () => {
        expect(emitNotSupportedError(observer)).to.be.a('function');
    });

    it('should return undefined', () => {
        expect(emitNotSupportedError(observer)()).to.be.undefined;
    });

});
