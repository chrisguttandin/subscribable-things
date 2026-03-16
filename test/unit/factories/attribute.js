import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAttribute } from '../../../src/factories/attribute';

describe('attribute()', () => {
    let attribute;
    let htmlElement;
    let mapSubscribableThing;
    let mutations;
    let name;
    let prependSubscribableThing;

    beforeEach(() => {
        htmlElement = { getAttribute: vi.fn() };
        mapSubscribableThing = vi.fn();
        mutations = vi.fn();
        name = 'a fake name';
        prependSubscribableThing = vi.fn();

        attribute = createAttribute(mapSubscribableThing, mutations, prependSubscribableThing);
    });

    it('should call prependSubscribableThing()', () => {
        const attributeValue = 'a fake attribute value';
        const subscribableThing = 'a fake subscribable thing';

        htmlElement.getAttribute.mockReturnValue(attributeValue);
        mapSubscribableThing.mockReturnValue(subscribableThing);

        attribute(htmlElement, name);

        expect(prependSubscribableThing).to.have.been.calledOnce.and.calledWith(subscribableThing, attributeValue);
    });

    it('should call mapSubscribableThing()', () => {
        const subscribableThing = 'a fake subscribable thing';

        mutations.mockReturnValue(subscribableThing);

        attribute(htmlElement, name);

        expect(mapSubscribableThing).to.have.been.calledOnce;
        expect(mapSubscribableThing).to.have.been.calledWith(subscribableThing, expect.any(Function));
    });

    it('should call mutations()', () => {
        attribute(htmlElement, name);

        expect(mutations).to.have.been.calledOnce.and.calledWith(htmlElement, {
            attributeFilter: [name],
            childList: false,
            subtree: false
        });
    });

    it('should call getAttribute()', () => {
        attribute(htmlElement, name);

        expect(htmlElement.getAttribute).to.have.been.calledOnce.and.calledWith(name);
    });

    it('should return the value returned by prependSubscribableThing()', () => {
        const value = 'a fake return value';

        prependSubscribableThing.mockReturnValue(value);

        expect(attribute(htmlElement, name)).to.equal(value);
    });
});
