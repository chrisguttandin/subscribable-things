import * as subscribableThings from '../../src/module';

describe('module', () => {
    it('should export all expected exports', () => {
        expect(subscribableThings).to.have.keys(
            'animationFrame',
            'intersections',
            'mediaDevices',
            'mediaQueryMatch',
            'metrics',
            'midiInputs',
            'midiOutputs',
            'mutations',
            'online',
            'permissionState',
            'reports',
            'resizes',
            'unhandledRejection'
        );
    });
});
