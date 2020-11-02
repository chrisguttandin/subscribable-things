import { IHTMLVideoElement, IVideoFrameMetadata } from '../interfaces';
import { TSubscribableThing } from './subscribable-thing';

export type TVideoFrameFunction = (videoElement: IHTMLVideoElement) => TSubscribableThing<{ now: number } & IVideoFrameMetadata>;
