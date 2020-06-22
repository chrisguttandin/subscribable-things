import { IResizeObserverOptions } from './resize-observer-options';

// @todo TypeScript does not include type definitions for the Resize Observer specification yet.
export interface IResizeObserver {
    disconnect(): void;

    observe(target: Element, options?: IResizeObserverOptions): void;

    unobserve(target: Element): void;
}
