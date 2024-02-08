import { first, from } from 'rxjs';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { wakeLock } from '../../src/module';
import xs from 'xstream';

describe('wakeLock', () => {
    if (navigator.wakeLock !== undefined && navigator.userAgent.includes('Chrome')) {
        after(() => fetch('/reset-permissions', { body: JSON.stringify({ origin: location.origin }), method: 'POST' }));

        before(() =>
            fetch('/grant-permissions', {
                body: JSON.stringify({ origin: location.origin, permissions: ['wakeLockScreen'] }),
                headers: { 'content-type': 'application/json' },
                method: 'POST'
            })
        );
    }

    it('should work with RxJS', (done) => {
        if (navigator.wakeLock === undefined) {
            from(wakeLock('screen')).subscribe({
                error(err) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                }
            });
        } else if (!/Chrome/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent)) {
            from(wakeLock('screen')).subscribe({
                error(err) {
                    expect(err.name).to.equal('NotAllowedError');

                    done();
                }
            });
        } else {
            from(wakeLock('screen'))
                .pipe(first())
                .subscribe((isLocked) => {
                    expect(isLocked).to.be.true;

                    done();
                });
        }
    });

    it('should work with XStream', (done) => {
        if (navigator.wakeLock === undefined) {
            xs.fromObservable(wakeLock('screen')).subscribe({
                error(err) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                }
            });
        } else if (!/Chrome/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent)) {
            xs.fromObservable(wakeLock('screen')).subscribe({
                error(err) {
                    expect(err.name).to.equal('NotAllowedError');

                    done();
                }
            });
        } else {
            xs.fromObservable(wakeLock('screen'))
                .take(1)
                .subscribe({
                    next(isLocked) {
                        expect(isLocked).to.be.true;

                        done();
                    }
                });
        }
    });

    it('should work with callbags', (done) => {
        if (navigator.wakeLock === undefined) {
            fromObs(wakeLock('screen'))(0, (code, err) => {
                if (code === 2) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');
                }

                done();
            });
        } else if (!/Chrome/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent)) {
            fromObs(wakeLock('screen'))(0, (code, err) => {
                if (code === 2) {
                    expect(err.name).to.equal('NotAllowedError');
                }

                done();
            });
        } else {
            pipe(
                fromObs(wakeLock('screen')),
                take(1),
                forEach((isLocked) => {
                    expect(isLocked).to.be.true;

                    done();
                })
            );
        }
    });

    it('should work with Bacon.js', (done) => {
        if (navigator.wakeLock === undefined) {
            fromESObservableBaconJs(wakeLock('screen')).onError((err) => {
                expect(err.message).to.equal('The required browser API seems to be not supported.');

                done();
            });
        } else if (!/Chrome/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent)) {
            fromESObservableBaconJs(wakeLock('screen')).onError((err) => {
                expect(err.name).to.equal('NotAllowedError');

                done();
            });
        } else {
            fromESObservableBaconJs(wakeLock('screen'))
                .first()
                .onValue((isLocked) => {
                    expect(isLocked).to.be.true;

                    done();
                });
        }
    });

    it('should work with Kefir.js', (done) => {
        if (navigator.wakeLock === undefined) {
            fromESObservableKefirJs(wakeLock('screen')).onError((err) => {
                expect(err.message).to.equal('The required browser API seems to be not supported.');

                done();
            });
        } else if (!/Chrome/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent)) {
            fromESObservableKefirJs(wakeLock('screen')).onError((err) => {
                expect(err.name).to.equal('NotAllowedError');

                done();
            });
        } else {
            fromESObservableKefirJs(wakeLock('screen'))
                .take(1)
                .onValue((isLocked) => {
                    expect(isLocked).to.be.true;

                    done();
                });
        }
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(wakeLock('screen'));

        if (navigator.wakeLock === undefined) {
            try {
                eachValueFrom(source$)[Symbol.asyncIterator]();
            } catch (err) {
                expect(err.message).to.equal('The required browser API seems to be not supported.');
            }
        } else if (!/Chrome/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent)) {
            try {
                eachValueFrom(source$)[Symbol.asyncIterator]();
            } catch (err) {
                expect(err.name).to.equal('NotAllowedError');
            }
        } else {
            // eslint-disable-next-line no-unreachable-loop
            for await (const isLocked of eachValueFrom(source$)) {
                expect(isLocked).to.be.true;

                break;
            }
        }
    });

    if (navigator.wakeLock !== undefined) {
        describe('with a finalization registry', () => {
            let finalizationRegistry;
            let whenCollected;

            afterEach(function (done) {
                this.timeout(0);

                const arrayBuffers = [];

                let byteLength = 100;

                const interval = setInterval(() => {
                    try {
                        arrayBuffers.push(new ArrayBuffer(byteLength));

                        byteLength *= 10;
                    } catch {
                        byteLength /= 10;
                    }
                });

                whenCollected = () => {
                    clearInterval(interval);
                    done();
                };
            });

            // eslint-disable-next-line no-undef
            beforeEach(() => (finalizationRegistry = new FinalizationRegistry(() => whenCollected())));

            it('should work with hyperf', async () => {
                const test = h`<div id="test">${wakeLock('screen')}</div>`;

                setTimeout(() => document.body.appendChild(test));
                finalizationRegistry.register(test);

                while (true) {
                    try {
                        expect(document.getElementById('test').textContent).to.equal('true');

                        break;
                    } catch {
                        await new Promise((resolve) => {
                            setTimeout(resolve, 100);
                        });
                    }
                }

                document.body.removeChild(test);
            });
        });
    }
});
