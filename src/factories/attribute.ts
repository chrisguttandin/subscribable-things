import { TSubscribableThing } from '../types';
import type { createMapSubscribableThing } from './map-subscribable-thing';
import type { createMutations } from './mutations';
import type { createPrependSubscribableThing } from './prepend-subscribable-thing';

export const createAttribute = (
    mapSubscribableThing: ReturnType<typeof createMapSubscribableThing>,
    mutations: ReturnType<typeof createMutations>,
    prependSubscribableThing: ReturnType<typeof createPrependSubscribableThing>
) => {
    return (htmlElement: HTMLElement, name: string): TSubscribableThing<null | string> => {
        const getAttribute = () => htmlElement.getAttribute(name);

        return prependSubscribableThing(
            mapSubscribableThing(
                mutations(htmlElement, {
                    attributeFilter: [name],
                    childList: false,
                    subtree: false
                }),
                () => getAttribute()
            ),
            getAttribute()
        );
    };
};
