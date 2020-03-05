import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable } from 'baconjs';
import { reports } from '../../src/module';
import xs from 'xstream';

describe('reports', () => {

    before(() => navigator.vibrate(0));

    it('should work with RxJS', (done) => {
        if (window.ReportingObserver === undefined) {
            from(reports({ buffered: true }))
                .subscribe(null, (err) => {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                });
        } else {
            from(reports({ buffered: true }))
                .pipe(first())
                .subscribe((reportList) => {
                    expect(reportList.length).to.equal(1);
                    expect(reportList[0].toJSON()).to.have.keys([ 'body', 'type', 'url' ]);

                    done();
                });
        }
    });

    it('should work with XStream', (done) => {
        if (window.ReportingObserver === undefined) {
            xs.fromObservable(reports({ buffered: true }))
                .subscribe({
                    error (err) {
                        expect(err.message).to.equal('The required browser API seems to be not supported.');

                        done();
                    }
                });
        } else {
            xs.fromObservable(reports({ buffered: true }))
                .take(1)
                .subscribe({
                    next (reportList) {
                        expect(reportList.length).to.equal(1);
                        expect(reportList[0].toJSON()).to.have.keys([ 'body', 'type', 'url' ]);

                        done();
                    }
                });
        }
    });

    it('should work with callbags', (done) => {
        if (window.ReportingObserver === undefined) {
            fromObs(reports({ buffered: true }))(0, ((code, err) => {
                if (code === 2) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');
                }

                done();
            }));
        } else {
            pipe(
                fromObs(reports({ buffered: true })),
                take(1),
                forEach((reportList) => {
                    expect(reportList.length).to.equal(1);
                    expect(reportList[0].toJSON()).to.have.keys([ 'body', 'type', 'url' ]);

                    done();
                })
            );
        }
    });

    it('should work with Bacon.js', (done) => {
        if (window.ReportingObserver === undefined) {
            fromESObservable(reports({ buffered: true }))
                .onError((err) => {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                });
        } else {
            fromESObservable(reports({ buffered: true }))
                .first()
                .onValue((reportList) => {
                    expect(reportList.length).to.equal(1);
                    expect(reportList[0].toJSON()).to.have.keys([ 'body', 'type', 'url' ]);

                    done();
                });
        }
    });

});
