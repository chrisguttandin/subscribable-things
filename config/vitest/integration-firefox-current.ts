import { env } from 'node:process';
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
        browser: {
            enabled: true,
            instances: [
                {
                    browser: 'firefox',
                    headless: env.CI !== 'true',
                    name: 'Firefox',
                    provider: webdriverio({
                        capabilities: {
                            'moz:firefoxOptions': {
                                prefs: {
                                    'dom.webmidi.enabled': false,
                                    'geo.provider.network.url': `data:application/json,${JSON.stringify({ accuracy: 1, location: { lat: 50, lng: 50 } })}`,
                                    'geo.provider.testing': true,
                                    'permissions.default.geo': 1
                                }
                            }
                        }
                    })
                }
            ]
        },
        dir: 'test/integration/',
        include: ['**/*.js'],
        watch: false
    }
});
