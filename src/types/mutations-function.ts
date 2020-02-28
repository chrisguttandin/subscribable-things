import { TSubscribableThing } from './subscribable-thing';

export type TMutationsFunction = (htmlElement: HTMLElement, options: MutationObserverInit) => TSubscribableThing<MutationRecord[]>;
