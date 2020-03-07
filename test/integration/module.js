import * as subscribableThings from '../../src/module';

describe('module', () => {

    it('should export all expected exports', () => {
        expect(subscribableThings).to.have.keys('mediaDevices', 'mediaQueryMatch', 'mutations', 'permissionState', 'reports');
    });

});
