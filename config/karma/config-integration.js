const { env } = require('process');
const { json } = require('body-parser');
const { DefinePlugin } = require('webpack');
const { request } = require('http');
const { Buffer } = require('buffer');
const WebSocket = require('ws');
const { MidiDst, MidiSrc } = require('midi-test');

// eslint-disable-next-line padding-line-between-statements
const GEOLOCATION = { accuracy: 1, latitude: 50, longitude: 50 };

// eslint-disable-next-line padding-line-between-statements
const fetch = () =>
    new Promise((resolve) => {
        request('http://localhost:9222/json', (response) => {
            let buffer = null;

            response
                .on('data', (chunk) => {
                    buffer = buffer === null ? chunk : Buffer.concat([buffer, chunk], buffer.byteLength + chunk.byteLength);
                })
                .on('end', () => {
                    resolve(JSON.parse(buffer.toString()));
                });
        }).end();
    });
const send = (webSocketDebuggerUrl, method, params) =>
    new Promise((resolve) => {
        const webSocket = new WebSocket(webSocketDebuggerUrl);
        const id = Math.round(Math.random() * 1000);

        webSocket.once('open', () => {
            const resolvePromise = (data) => {
                if (JSON.parse(data).id === id) {
                    webSocket.off('message', resolvePromise);

                    resolve();
                }
            };

            webSocket.on('message', resolvePromise);
            webSocket.send(JSON.stringify({ id, method, params }));
        });
    });
const respond = (res) => {
    res.writeHead(200, { 'access-control-allow-origin': '*' });
    res.end();
};

module.exports = (config) => {
    config.set({
        basePath: '../../',

        browserDisconnectTimeout: 100000,

        browserNoActivityTimeout: 100000,

        client: {
            mocha: {
                bail: true,
                timeout: 20000
            }
        },

        concurrency: 1,

        files: [
            {
                included: false,
                pattern: 'src/**',
                served: false,
                watched: true
            },
            'test/integration/**/*.js'
        ],

        frameworks: ['mocha', 'sinon-chai'],

        middleware: ['dev-tools'],

        plugins: [
            {
                'middleware:dev-tools': [
                    'factory',
                    function () {
                        const jsonMiddleware = json();

                        let virtualInputDevice;
                        let virtualOutputDevice;

                        return (req, res, next) => {
                            if (req.url === '/clear-geolocation') {
                                fetch('http://localhost:9222/json')
                                    .then(([{ webSocketDebuggerUrl }]) => send(webSocketDebuggerUrl, 'Emulation.clearGeolocationOverride'))
                                    .then(() => respond(res));
                            } else if (req.url === '/grant-permissions') {
                                jsonMiddleware(req, res, () => {
                                    fetch('http://localhost:9222/json')
                                        .then(([{ webSocketDebuggerUrl }]) =>
                                            send(webSocketDebuggerUrl, 'Browser.grantPermissions', {
                                                origin: 'http://localhost:9876',
                                                permissions: req.body
                                            })
                                        )
                                        .then(() => {
                                            if (req.body.includes('midi')) {
                                                virtualInputDevice = new MidiSrc('Virtual Input Device');
                                                virtualInputDevice.connect();

                                                virtualOutputDevice = new MidiDst('Virtual Output Device');
                                                virtualOutputDevice.connect();
                                            }

                                            respond(res);
                                        });
                                });
                            } else if (req.url === '/emulate-geolocation') {
                                fetch('http://localhost:9222/json')
                                    .then(([{ webSocketDebuggerUrl }]) =>
                                        send(webSocketDebuggerUrl, 'Emulation.setGeolocationOverride', GEOLOCATION)
                                    )
                                    .then(() => respond(res));
                            } else if (req.url === '/reset-permissions') {
                                fetch('http://localhost:9222/json')
                                    .then(([{ webSocketDebuggerUrl }]) =>
                                        send(webSocketDebuggerUrl, 'Browser.resetPermissions', { origin: 'http://localhost:9876' })
                                    )
                                    .then(() => {
                                        virtualInputDevice?.disconnect();
                                        virtualOutputDevice?.disconnect();

                                        respond(res);
                                    });
                            } else {
                                next();
                            }
                        };
                    }
                ]
            },
            'karma-*'
        ],

        preprocessors: {
            'test/integration/**/*.js': 'webpack'
        },

        reporters: ['dots'],

        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.ts?$/,
                        use: {
                            loader: 'ts-loader',
                            options: {
                                compilerOptions: {
                                    declaration: false,
                                    declarationMap: false
                                }
                            }
                        }
                    }
                ]
            },
            plugins: [
                new DefinePlugin({
                    'process.env': {
                        CI: JSON.stringify(env.CI)
                    }
                })
            ],
            resolve: {
                extensions: ['.js', '.ts'],
                fallback: { util: false }
            }
        },

        webpackMiddleware: {
            noInfo: true
        }
    });

    if (env.CI) {
        config.set({
            browserStack: {
                accessKey: env.BROWSER_STACK_ACCESS_KEY,
                build: `${env.GITHUB_RUN_ID}/integration-${env.TARGET}`,
                forceLocal: true,
                localIdentifier: `${Math.floor(Math.random() * 1000000)}`,
                project: env.GITHUB_REPOSITORY,
                username: env.BROWSER_STACK_USERNAME,
                video: false
            },

            browsers:
                env.TARGET === 'chrome'
                    ? ['ChromeHeadlessWithFakeDevice']
                    : env.TARGET === 'firefox'
                    ? ['FirefoxBrowserStack']
                    : env.TARGET === 'safari'
                    ? ['SafariBrowserStack']
                    : ['ChromeHeadlessWithFakeDevice', 'FirefoxBrowserStack', 'SafariBrowserStack'],

            captureTimeout: 300000,

            customLaunchers: {
                ChromeHeadlessWithFakeDevice: {
                    base: 'ChromeHeadless',
                    flags: ['--no-sandbox', '--use-fake-device-for-media-stream']
                },
                FirefoxBrowserStack: {
                    base: 'BrowserStack',
                    browser: 'firefox',
                    captureTimeout: 300,
                    os: 'Windows',
                    os_version: '10' // eslint-disable-line camelcase
                },
                SafariBrowserStack: {
                    base: 'BrowserStack',
                    browser: 'safari',
                    captureTimeout: 300,
                    os: 'OS X',
                    os_version: 'Big Sur' // eslint-disable-line camelcase
                }
            }
        });
    } else {
        config.set({
            browsers: ['ChromeCanaryHeadless', 'ChromeHeadless', 'FirefoxDeveloperWithPrefs', 'FirefoxHeadlessWithPrefs', 'Safari'],

            customLaunchers: {
                FirefoxDeveloperWithPrefs: {
                    base: 'FirefoxDeveloperHeadless',
                    prefs: {
                        'dom.webmidi.enabled': false,
                        'geo.provider.network.url': `data:application/json,${JSON.stringify({
                            accuracy: GEOLOCATION.accuracy,
                            location: { lat: GEOLOCATION.latitude, lng: GEOLOCATION.longitude }
                        })}`,
                        'geo.provider.testing': true,
                        'permissions.default.geo': 1
                    }
                },
                FirefoxHeadlessWithPrefs: {
                    base: 'FirefoxHeadless',
                    prefs: {
                        'dom.webmidi.enabled': false,
                        'geo.provider.network.url': `data:application/json,${JSON.stringify({
                            accuracy: GEOLOCATION.accuracy,
                            location: { lat: GEOLOCATION.latitude, lng: GEOLOCATION.longitude }
                        })}`,
                        'geo.provider.testing': true,
                        'permissions.default.geo': 1
                    }
                }
            }
        });
    }
};
