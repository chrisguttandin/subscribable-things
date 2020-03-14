import * as subscribableThings from '../../src/module';

describe('module', () => {

    it('should export all expected exports', () => {
        expect(subscribableThings).to.have.keys('intersections', 'mediaDevices', 'mediaQueryMatch', 'midiInputs', 'midiOutputs', 'mutations', 'permissionState', 'reports', 'resizes', 'unhandledRejection');
    });

});
