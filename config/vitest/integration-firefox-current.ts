import { webdriverio } from '@vitest/browser-webdriverio';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        bail: 1,
        browser: {
            enabled: true,
            instances: [
                {
                    browser: 'firefox',
                    headless: true,
                    name: 'Firefox',
                    provider: webdriverio({
                        capabilities: {
                            'moz:firefoxOptions': {
                                prefs: {
                                    'geo.provider.network.url': `data:application/json,${JSON.stringify({ accuracy: 1, location: { lat: 50, lng: 50 } })}`,
                                    'geo.provider.testing': true,
                                    'media.navigator.permission.disabled': true,
                                    'midi.prompt.testing': true,
                                    'midi.testing': true,
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
