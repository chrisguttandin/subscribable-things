import { IResizeObserverSize } from './resize-observer-size';

// @todo TypeScript does not include type definitions for the Resize Observer specification yet.
export interface IResizeObserverEntry {
    readonly borderBoxSize: readonly IResizeObserverSize[];

    readonly contentBoxSize: readonly IResizeObserverSize[];

    readonly contentRect: DOMRectReadOnly;

    readonly devicePixelContentBoxSize: readonly IResizeObserverSize[];

    readonly target: Element;
}
