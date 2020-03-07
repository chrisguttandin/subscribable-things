import { IResizeObserverEntry, IResizeObserverOptions } from '../interfaces';
import { TSubscribableThing } from './subscribable-thing';

export type TResizesFunction = (htmlElement: HTMLElement, options?: IResizeObserverOptions) => TSubscribableThing<IResizeObserverEntry[]>;
