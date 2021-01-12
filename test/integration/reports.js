import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { reports } from '../../src/module';
import xs from 'xstream';

describe('reports', () => {
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
                    expect(reportList.length).to.equal(2);
                    expect(reportList[0].toJSON()).to.have.keys(['body', 'type', 'url']);
                    expect(reportList[1].toJSON()).to.have.keys(['body', 'type', 'url']);

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
                        expect(reportList.length).to.equal(2);
                        expect(reportList[0].toJSON()).to.have.keys(['body', 'type', 'url']);
                        expect(reportList[1].toJSON()).to.have.keys(['body', 'type', 'url']);

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
                    expect(reportList.length).to.equal(2);
                    expect(reportList[0].toJSON()).to.have.keys(['body', 'type', 'url']);
                    expect(reportList[1].toJSON()).to.have.keys(['body', 'type', 'url']);

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
                    expect(reportList.length).to.equal(2);
                    expect(reportList[0].toJSON()).to.have.keys(['body', 'type', 'url']);
                    expect(reportList[1].toJSON()).to.have.keys(['body', 'type', 'url']);

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
                    expect(reportList.length).to.equal(2);
                    expect(reportList[0].toJSON()).to.have.keys(['body', 'type', 'url']);
                    expect(reportList[1].toJSON()).to.have.keys(['body', 'type', 'url']);

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
                expect(reportList.length).to.equal(2);
                expect(reportList[0].toJSON()).to.have.keys(['body', 'type', 'url']);
                expect(reportList[1].toJSON()).to.have.keys(['body', 'type', 'url']);

                break;
            }
        }
    });
});
