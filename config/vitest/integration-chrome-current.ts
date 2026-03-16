import { webdriverio } from '@vitest/browser-webdriverio';
import { MidiDst, MidiSrc } from 'midi-test';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
        {
            config: () => {
                let virtualInputDevice: null | InstanceType<typeof MidiSrc> = null;
                let virtualOutputDevice: null | InstanceType<typeof MidiDst> = null;

                return {
                    test: {
                        browser: {
                            commands: {
                                connectMidiDevices: () => {
                                    virtualInputDevice = new MidiSrc('Virtual Input Device');
                                    virtualOutputDevice = new MidiDst('Virtual Output Device');

                                    virtualInputDevice.connect();
                                    virtualOutputDevice.connect();
                                },
                                disconnectMidiDevices: () => {
                                    virtualInputDevice?.disconnect();
                                    virtualOutputDevice?.disconnect();
                                }
                            }
                        }
                    }
                };
            },
            name: 'midi-commands'
        }
    ],
    test: {
        bail: 1,
        browser: { enabled: true, instances: [{ browser: 'chrome', headless: true, name: 'Chrome', provider: webdriverio() }] },
        dir: 'test/integration/',
        include: ['**/*.js'],
        watch: false
    }
});
