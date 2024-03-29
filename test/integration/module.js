import * as subscribableThings from '../../src/module';

describe('module', () => {
    it('should export all expected exports', () => {
        expect(subscribableThings).to.have.keys(
            'animationFrame',
            'attribute',
            'geolocation',
            'intersections',
            'mediaDevices',
            'mediaQueryMatch',
            'metrics',
            'midiInputs',
            'midiOutputs',
            'mutations',
            'on',
            'online',
            'permissionState',
            'reports',
            'resizes',
            'unhandledRejection',
            'videoFrame',
            'wakeLock'
        );
    });
});
