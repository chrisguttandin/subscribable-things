import { TVideoFrameRequestCallback } from '../types';

// @todo TypeScript does not yet include type definitions for the cancelVideoFrameCallback and requestVideoFrameCallback methods.
export interface IHTMLVideoElement extends HTMLVideoElement {
    cancelVideoFrameCallback(handle: number): void;

    requestVideoFrameCallback(callback: TVideoFrameRequestCallback): number;
}
