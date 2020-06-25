const { env } = require('process');
const { DefinePlugin } = require('webpack');
const { request } = require('http');
const { Buffer } = require('buffer');
const WebSocket = require('ws');
const { MidiDst, MidiSrc } = require('midi-test');

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
        const id = 23;

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
        browserNoActivityTimeout: 20000,

        concurrency: 1,

        files: ['../../test/integration/**/*.js'],

        frameworks: ['mocha', 'sinon-chai'],

        middleware: ['dev-tools'],

        plugins: [
            {
                'middleware:dev-tools': [
                    'factory',
                    function () {
                        let virtualInputDevice;
                        let virtualOutputDevice;

                        return (req, res, next) => {
                            if (req.url === '/grant-permissions') {
                                fetch('http://localhost:9222/json')
                                    .then(([{ webSocketDebuggerUrl }]) =>
                                        send(webSocketDebuggerUrl, 'Browser.grantPermissions', {
                                            origin: 'http://localhost:9876',
                                            permissions: ['midi', 'midiSysex']
                                        })
                                    )
                                    .then(() => {
                                        virtualInputDevice = new MidiSrc('Virtual Input Device');
                                        virtualInputDevice.connect();

                                        virtualOutputDevice = new MidiDst('Virtual Output Device');
                                        virtualOutputDevice.connect();

                                        respond(res);
                                    });
                            } else if (req.url === '/reset-permissions') {
                                fetch('http://localhost:9222/json')
                                    .then(([{ webSocketDebuggerUrl }]) =>
                                        send(webSocketDebuggerUrl, 'Browser.resetPermissions', { origin: 'http://localhost:9876' })
                                    )
                                    .then(() => {
                                        virtualInputDevice.disconnect();
                                        virtualOutputDevice.disconnect();

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
            '../../test/integration/**/*.js': 'webpack'
        },

        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.ts?$/,
                        use: {
                            loader: 'ts-loader'
                        }
                    }
                ]
            },
            plugins: [
                new DefinePlugin({
                    'process.env': {
                        TARGET: JSON.stringify(env.TARGET),
                        TRAVIS: JSON.stringify(env.TRAVIS)
                    }
                })
            ],
            resolve: {
                extensions: ['.js', '.ts']
            }
        },

        webpackMiddleware: {
            noInfo: true
        }
    });

    if (env.TRAVIS) {
        config.set({
            browserStack: {
                accessKey: env.BROWSER_STACK_ACCESS_KEY,
                build: `${env.TRAVIS_REPO_SLUG}/${env.TRAVIS_JOB_NUMBER}/integration-${env.TARGET}`,
                username: env.BROWSER_STACK_USERNAME,
                video: false
            },

            browsers:
                env.TARGET === 'chrome'
                    ? ['ChromeHeadlessWithFakeDevice']
                    : env.TARGET === 'firefox' || env.TARGET === 'firefox-unsupported'
                    ? ['FirefoxBrowserStack']
                    : ['ChromeHeadlessWithFakeDevice', 'FirefoxBrowserStack'],

            captureTimeout: 120000,

            customLaunchers: {
                ChromeHeadlessWithFakeDevice: {
                    base: 'ChromeHeadless',
                    flags: ['--no-sandbox', '--use-fake-device-for-media-stream']
                },
                FirefoxBrowserStack: {
                    base: 'BrowserStack',
                    browser: 'firefox',
                    ...(env.TARGET.endsWith('-unsupported') ? { browser_version: '70' } : null), // eslint-disable-line camelcase
                    os: 'Windows',
                    os_version: '10' // eslint-disable-line camelcase
                }
            }
        });
    } else {
        config.set({
            browsers: ['ChromeCanaryHeadless', 'ChromeHeadless', 'FirefoxDeveloperHeadless', 'FirefoxHeadless']
        });
    }
};
