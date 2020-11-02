import { IVideoFrameMetadata } from '../interfaces';

// @todo TypeScript does not yet include a type definition for the VideoFrameRequestCallback function.
export type TVideoFrameRequestCallback = (now: number, metadata: IVideoFrameMetadata) => void;
