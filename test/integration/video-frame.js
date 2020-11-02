import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { videoFrame } from '../../src/module';
import xs from 'xstream';

describe('videoFrame', () => {
    let videoElement;

    afterEach(() => {
        if (videoElement.requestVideoFrameCallback !== undefined) {
            videoElement.pause();
            videoElement.srcObject = null;
        }
    });

    beforeEach(() => {
        videoElement = document.createElement('video');

        if (videoElement.requestVideoFrameCallback !== undefined) {
            const canvas = document.createElement('canvas');

            videoElement.muted = true;
            videoElement.srcObject = canvas.captureStream();
            videoElement.play();

            canvas.height = 100;
            canvas.width = 100;

            const context = canvas.getContext('2d');

            context.fillStyle = '#000';
            context.fillRect(0, 0, 100, 100);
        }
    });

    it('should work with RxJS', (done) => {
        if (videoElement.requestVideoFrameCallback === undefined) {
            from(videoFrame(videoElement)).subscribe(null, (err) => {
                expect(err.message).to.equal('The required browser API seems to be not supported.');

                done();
            });
        } else {
            from(videoFrame(videoElement))
                .pipe(first())
                .subscribe((videoFrameMetadata) => {
                    expect(videoFrameMetadata.expectedDisplayTime).to.be.a('number');
                    expect(videoFrameMetadata.height).to.equal(100);
                    expect(videoFrameMetadata.mediaTime).to.be.a('number');
                    expect(videoFrameMetadata.now).to.be.a('number');
                    expect(videoFrameMetadata.presentationTime).to.be.a('number');
                    expect(videoFrameMetadata.presentedFrames).to.be.a('number');
                    expect(videoFrameMetadata.width).to.equal(100);

                    done();
                });
        }
    });

    it('should work with XStream', (done) => {
        if (videoElement.requestVideoFrameCallback === undefined) {
            xs.fromObservable(videoFrame(videoElement)).subscribe({
                error(err) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                }
            });
        } else {
            xs.fromObservable(videoFrame(videoElement))
                .take(1)
                .subscribe({
                    next(videoFrameMetadata) {
                        expect(videoFrameMetadata.expectedDisplayTime).to.be.a('number');
                        expect(videoFrameMetadata.height).to.equal(100);
                        expect(videoFrameMetadata.mediaTime).to.be.a('number');
                        expect(videoFrameMetadata.now).to.be.a('number');
                        expect(videoFrameMetadata.presentationTime).to.be.a('number');
                        expect(videoFrameMetadata.presentedFrames).to.be.a('number');
                        expect(videoFrameMetadata.width).to.equal(100);

                        done();
                    }
                });
        }
    });

    it('should work with callbags', (done) => {
        if (videoElement.requestVideoFrameCallback === undefined) {
            fromObs(videoFrame(videoElement))(0, (code, err) => {
                if (code === 2) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');
                }

                done();
            });
        } else {
            pipe(
                fromObs(videoFrame(videoElement)),
                take(1),
                forEach((videoFrameMetadata) => {
                    expect(videoFrameMetadata.expectedDisplayTime).to.be.a('number');
                    expect(videoFrameMetadata.height).to.equal(100);
                    expect(videoFrameMetadata.mediaTime).to.be.a('number');
                    expect(videoFrameMetadata.now).to.be.a('number');
                    expect(videoFrameMetadata.presentationTime).to.be.a('number');
                    expect(videoFrameMetadata.presentedFrames).to.be.a('number');
                    expect(videoFrameMetadata.width).to.equal(100);

                    done();
                })
            );
        }
    });

    it('should work with Bacon.js', (done) => {
        if (videoElement.requestVideoFrameCallback === undefined) {
            fromESObservableBaconJs(videoFrame(videoElement)).onError((err) => {
                expect(err.message).to.equal('The required browser API seems to be not supported.');

                done();
            });
        } else {
            fromESObservableBaconJs(videoFrame(videoElement))
                .first()
                .onValue((videoFrameMetadata) => {
                    expect(videoFrameMetadata.expectedDisplayTime).to.be.a('number');
                    expect(videoFrameMetadata.height).to.equal(100);
                    expect(videoFrameMetadata.mediaTime).to.be.a('number');
                    expect(videoFrameMetadata.now).to.be.a('number');
                    expect(videoFrameMetadata.presentationTime).to.be.a('number');
                    expect(videoFrameMetadata.presentedFrames).to.be.a('number');
                    expect(videoFrameMetadata.width).to.equal(100);

                    done();
                });
        }
    });

    it('should work with Kefir.js', (done) => {
        if (videoElement.requestVideoFrameCallback === undefined) {
            fromESObservableKefirJs(videoFrame(videoElement)).onError((err) => {
                expect(err.message).to.equal('The required browser API seems to be not supported.');

                done();
            });
        } else {
            fromESObservableKefirJs(videoFrame(videoElement))
                .take(1)
                .onValue((videoFrameMetadata) => {
                    expect(videoFrameMetadata.expectedDisplayTime).to.be.a('number');
                    expect(videoFrameMetadata.height).to.equal(100);
                    expect(videoFrameMetadata.mediaTime).to.be.a('number');
                    expect(videoFrameMetadata.now).to.be.a('number');
                    expect(videoFrameMetadata.presentationTime).to.be.a('number');
                    expect(videoFrameMetadata.presentedFrames).to.be.a('number');
                    expect(videoFrameMetadata.width).to.equal(100);

                    done();
                });
        }
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(videoFrame(videoElement));

        if (videoElement.requestVideoFrameCallback === undefined) {
            try {
                eachValueFrom(source$)[Symbol.asyncIterator]();
            } catch (err) {
                expect(err.message).to.equal('The required browser API seems to be not supported.');
            }
        } else {
            // eslint-disable-next-line no-unreachable-loop
            for await (const videoFrameMetadata of eachValueFrom(source$)) {
                expect(videoFrameMetadata.expectedDisplayTime).to.be.a('number');
                expect(videoFrameMetadata.height).to.equal(100);
                expect(videoFrameMetadata.mediaTime).to.be.a('number');
                expect(videoFrameMetadata.now).to.be.a('number');
                expect(videoFrameMetadata.presentationTime).to.be.a('number');
                expect(videoFrameMetadata.presentedFrames).to.be.a('number');
                expect(videoFrameMetadata.width).to.equal(100);

                break;
            }
        }
    });
});
