import { midiInputs } from '../../src/module';

describe('midiInputs', () => {
    // @todo It is currently not possible to access MIDI devices in headless mode when using Karma.

    it('should be a function', () => {
        expect(midiInputs).to.be.a('function');
    });
});
