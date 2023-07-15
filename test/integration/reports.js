import { first, from } from 'rxjs';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { map } from '../helpers/map';
import { reports } from '../../src/module';
import xs from 'xstream';

describe('reports', () => {
    if (/Chrome/.test(navigator.userAgent) || !/Safari/.test(navigator.userAgent)) {
        before(() => {
            if (navigator.vibrate) {
                navigator.vibrate(0);
            }
        });

        it('should work with RxJS', (done) => {
            if (window.ReportingObserver === undefined) {
                from(reports({ buffered: true })).subscribe({
                    error(err) {
                        expect(err.message).to.equal('The required browser API seems to be not supported.');

                        done();
                    }
                });
            } else {
                from(reports({ buffered: true }))
                    .pipe(first())
                    .subscribe((reportList) => {
                        expect(reportList.length).to.equal(1);
                        expect(reportList[0].toJSON()).to.have.keys(['body', 'type', 'url']);

                        done();
                    });
            }
        });

        it('should work with XStream', (done) => {
            if (window.ReportingObserver === undefined) {
                xs.fromObservable(reports({ buffered: true })).subscribe({
                    error(err) {
                        expect(err.message).to.equal('The required browser API seems to be not supported.');

                        done();
                    }
                });
            } else {
                xs.fromObservable(reports({ buffered: true }))
                    .take(1)
                    .subscribe({
                        next(reportList) {
                            expect(reportList.length).to.equal(1);
                            expect(reportList[0].toJSON()).to.have.keys(['body', 'type', 'url']);

                            done();
                        }
                    });
            }
        });

        it('should work with callbags', (done) => {
            if (window.ReportingObserver === undefined) {
                fromObs(reports({ buffered: true }))(0, (code, err) => {
                    if (code === 2) {
                        expect(err.message).to.equal('The required browser API seems to be not supported.');
                    }

                    done();
                });
            } else {
                pipe(
                    fromObs(reports({ buffered: true })),
                    take(1),
                    forEach((reportList) => {
                        expect(reportList.length).to.equal(1);
                        expect(reportList[0].toJSON()).to.have.keys(['body', 'type', 'url']);

                        done();
                    })
                );
            }
        });

        it('should work with Bacon.js', (done) => {
            if (window.ReportingObserver === undefined) {
                fromESObservableBaconJs(reports({ buffered: true })).onError((err) => {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                });
            } else {
                fromESObservableBaconJs(reports({ buffered: true }))
                    .first()
                    .onValue((reportList) => {
                        expect(reportList.length).to.equal(1);
                        expect(reportList[0].toJSON()).to.have.keys(['body', 'type', 'url']);

                        done();
                    });
            }
        });

        it('should work with Kefir.js', (done) => {
            if (window.ReportingObserver === undefined) {
                fromESObservableKefirJs(reports({ buffered: true })).onError((err) => {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                });
            } else {
                fromESObservableKefirJs(reports({ buffered: true }))
                    .take(1)
                    .onValue((reportList) => {
                        expect(reportList.length).to.equal(1);
                        expect(reportList[0].toJSON()).to.have.keys(['body', 'type', 'url']);

                        done();
                    });
            }
        });

        it('should work with rxjs-for-await', async () => {
            const source$ = from(reports({ buffered: true }));

            if (window.ReportingObserver === undefined) {
                try {
                    eachValueFrom(source$)[Symbol.asyncIterator]();
                } catch (err) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');
                }
            } else {
                // eslint-disable-next-line no-unreachable-loop
                for await (const reportList of eachValueFrom(source$)) {
                    expect(reportList.length).to.equal(1);
                    expect(reportList[0].toJSON()).to.have.keys(['body', 'type', 'url']);

                    break;
                }
            }
        });

        if (window.ReportingObserver !== undefined) {
            describe('with a finalization registry', () => {
                let finalizationRegistry;
                let whenCollected;

                afterEach(function (done) {
                    this.timeout(0);

                    const arrayBuffers = [];
                    const interval = setInterval(() => {
                        try {
                            arrayBuffers.push(
                                new ArrayBuffer(arrayBuffers.length === 0 ? 100 : arrayBuffers[arrayBuffers.length - 1].byteLength * 10)
                            );
                        } catch {
                            arrayBuffers.pop();
                        }
                    }, 100);

                    whenCollected = () => {
                        clearInterval(interval);
                        done();
                    };
                });

                // eslint-disable-next-line no-undef
                beforeEach(() => (finalizationRegistry = new FinalizationRegistry(() => whenCollected())));

                it('should work with hyperf', async () => {
                    const test = h`<div id="test">${map(reports({ buffered: true }), (reportList) =>
                        reportList.map(({ type }) => type).join(',')
                    )}</div>`;

                    document.body.appendChild(test);
                    finalizationRegistry.register(test);

                    while (true) {
                        try {
                            expect(document.getElementById('test').textContent).to.equal('intervention');

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
    }
});
