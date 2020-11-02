// @todo TypeScript does not yet include a type definition for the VideoFrameMetadata object.
export interface IVideoFrameMetadata {
    captureTime?: number;

    expectedDisplayTime: number;

    height: number;

    mediaTime: number;

    presentationTime: number;

    presentedFrames: number;

    processingDuration?: number;

    receiveTime?: number;

    rtpTimestamp?: number;

    width: number;
}
