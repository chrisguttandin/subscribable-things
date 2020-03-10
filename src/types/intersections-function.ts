import { TSubscribableThing } from './subscribable-thing';

export type TIntersectionsFunction = (
    htmlElement: HTMLElement,
    options?: IntersectionObserverInit
) => TSubscribableThing<IntersectionObserverEntry[]>;
