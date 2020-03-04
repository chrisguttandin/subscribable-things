import * as subscribableThings from '../../src/module';

describe('module', () => {

    it('should export all expected exports', () => {
        expect(subscribableThings).to.have.keys('mediaQueryMatch', 'mutations', 'permissionState', 'reports');
    });

});
