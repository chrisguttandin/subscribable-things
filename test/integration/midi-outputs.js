import { midiOutputs } from '../../src/module';

describe('midiOutputs', () => {
    // @todo It is currently not possible to access MIDI devices in headless mode when using Karma.

    it('should be a function', () => {
        expect(midiOutputs).to.be.a('function');
    });
});
