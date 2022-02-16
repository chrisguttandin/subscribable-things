import { createAttribute } from '../../../src/factories/attribute';
import { stub } from 'sinon';

describe('attribute()', () => {
    let attribute;
    let htmlElement;
    let mapSubscribableThing;
    let mutations;
    let name;
    let prependSubscribableThing;

    beforeEach(() => {
        htmlElement = { getAttribute: stub() };
        mapSubscribableThing = stub();
        mutations = stub();
        name = 'a fake name';
        prependSubscribableThing = stub();

        attribute = createAttribute(mapSubscribableThing, mutations, prependSubscribableThing);
    });

    it('should call prependSubscribableThing()', () => {
        const attributeValue = 'a fake attribute value';
        const subscribableThing = 'a fake subscribable thing';

        htmlElement.getAttribute.returns(attributeValue);
        mapSubscribableThing.returns(subscribableThing);

        attribute(htmlElement, name);

        expect(prependSubscribableThing).to.have.been.calledOnce.and.calledWithExactly(subscribableThing, attributeValue);
    });

    it('should call mapSubscribableThing()', () => {
        const subscribableThing = 'a fake subscribable thing';

        mutations.returns(subscribableThing);

        attribute(htmlElement, name);

        expect(mapSubscribableThing).to.have.been.calledOnce;

        expect(mapSubscribableThing.firstCall.args.length).to.equal(2);
        expect(mapSubscribableThing.firstCall.args[0]).to.equal(subscribableThing);
        expect(mapSubscribableThing.firstCall.args[1]).to.be.a('function');
    });

    it('should call mutations()', () => {
        attribute(htmlElement, name);

        expect(mutations).to.have.been.calledOnce.and.calledWithExactly(htmlElement, {
            attributeFilter: [name],
            childList: false,
            subtree: false
        });
    });

    it('should call getAttribute()', () => {
        attribute(htmlElement, name);

        expect(htmlElement.getAttribute).to.have.been.calledOnce.and.calledWithExactly(name);
    });

    it('should return the value returned by prependSubscribableThing()', () => {
        const value = 'a fake return value';

        prependSubscribableThing.returns(value);

        expect(attribute(htmlElement, name)).to.equal(value);
    });
});
