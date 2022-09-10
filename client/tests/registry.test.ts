import 'mocha' // Otherwise vscode doesn't like describe and it

import { expect } from 'chai'
import { Registry } from '../src/engine/registry'

import { Transform } from '../src/components/transform'

describe('Registry tests', () => {
    describe('Entity', () => {
        it('Create an entity', () => {
            const registry = new Registry()
            const entity1 = registry.createEntity()
            expect(entity1).is.not.null
            expect(typeof entity1).equals('string')
        })

        it('Retrieve a single entity', () => {
            const registry = new Registry()
            const entity1 = registry.createEntity()
            const results = registry.getEntity(entity1)
            expect(results).equals(entity1)
        })

        it('Destroy an entity', () => {
            const registry = new Registry()
            const entity1 = registry.createEntity()

            registry.destroyEntity(entity1)

            const results = registry.getEntity(entity1)
            expect(results).is.undefined
        })

        it('Destroy an entity from a list of many', () => {
            const registry = new Registry()
            const entity1 = registry.createEntity()
            const entity2 = registry.createEntity()
            const entity3 = registry.createEntity()

            registry.destroyEntity(entity2)

            const results1 = registry.getEntity(entity1)
            expect(results1).is.not.undefined

            const results2 = registry.getEntity(entity2)
            expect(results2).is.undefined

            const results3 = registry.getEntity(entity3)
            expect(results3).is.not.undefined
        })
    })

    describe('Component', () => {
        it('Adds a component to an Entity', () => {
            const registry = new Registry()
            const entity1 = registry.createEntity()

            // Create a sample component
            const transform = new Transform(3, 5)

            registry.addComponent(entity1, transform)

            const component = registry.getComponent(entity1, 'transform') as Transform
            expect(component).is.not.undefined
            expect(component.type).equals('transform')
            expect(component.x).equals(transform.x)

            const components = registry.getComponentsByEntity(entity1)
            expect(components.length).to.equal(1)
            expect(components[0].type).equals('transform')

            const entities = registry.getEntitiesByComponentType('transform')
            expect(entities.length).to.equal(1)
            expect(entities[0]).equals(entity1)
        })
        it('Removes a component from an entity', () => {
            const registry = new Registry()
            const entity1 = registry.createEntity()

            // Create a sample component
            const transform = new Transform(3, 5)

            registry.addComponent(entity1, transform)

            registry.removeComponent(entity1, transform)

            const component = registry.getComponent(entity1, 'transform') as Transform
            expect(component).is.undefined
        })

        it('Does not allow duplicate components on the same entity', () => {
            const registry = new Registry()
            const entity1 = registry.createEntity()

            // Create a sample component
            const transform = new Transform(3, 5)

            registry.addComponent(entity1, transform)

            let errCount = 0
            try {
                registry.addComponent(entity1, transform)
            } catch (err) {
                expect(err).to.contain('There is already a component of type transform')
                errCount++
            }
            expect(errCount).to.equal(1)
        })
    })
})
