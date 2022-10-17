// ECS Registry - Entity, Component, Syste,
// Entities are an ID (string) that refers to a set of components
// Components contain data (no logic) and are referenced by components.
// Systems contain logic and act on components.
//
// Entities should never contain data or logic
// Components should never contain logic
// Each component and each system should do one thing (and only one thing !) well

import { v4 as uuidv4 } from 'uuid'
import { Transform } from '../components/transform'

export interface IComponent {
	type: string
}

export interface ISystem {
	awake?: () => void
	start?: () => void
	update?: () => void

	destroy?: () => void
}

export class Registry {
	// The entity we're associated with
	private entities: string[] = []

	// Data structure to support querying components by entities and entities by component
	private entitiesToComponents: Map<string, IComponent[]> = new Map() // For any entity id, get a component
	private componentTypesToEntities: Map<string, string[]> = new Map() // For any component type, get entities

	// Systems that act on components
	private systems: ISystem[] = []

	// Any systems that need to run their start() command.
	// start() will run on the first update() frame available
	private queuedForStart: ISystem[] = []

	// Entity Management
	// create a new entity and put it on our list
	createEntity = (id?: string) => {
		// Entity is just an id (uuid4)
		const entity = id ? id : uuidv4()
		this.entities.push(entity)
		this.entitiesToComponents.set(entity, []) // Initialize empty array of components so we don't get undefined later

		return entity
	}

	// Locate an entity by its id
	getEntity = (id: string) => {
		return this.entities.find((element) => element == id)
	}

	// Remove an entity from the game
	destroyEntity = (id: string) => {
		// Updates our list to exclude the current id
		this.entities = this.entities.filter((entity) => entity != id)

		// Remove entity from lookup tables so components don't still hang around
		// First get all components and remove this from their indexes (otherwise we would lose this list)

		if (this.entitiesToComponents.get(id)) {
			for (let i = 0; i < this.entitiesToComponents.get(id).length; i++) {
				const componentType = this.entitiesToComponents.get(id)[i].type

				// Remove this id from the record
				this.componentTypesToEntities.set(
					componentType,
					this.componentTypesToEntities
						.get(componentType)
						.filter((entity) => entity != id)
				)
			}
		}

		// Then remove this entity's indexes of components
		this.entitiesToComponents.delete(id)
	}

	// Add a compoment to a specific entity.
	addComponent = (entity: string, component: IComponent) => {
		// Check to make sure we don't already have a component of this type on an entity
		if (
			!this.entitiesToComponents
				.get(entity)
				.find((existing) => existing.type == component.type)
		) {
			// Add this component to the entity
			this.entitiesToComponents.get(entity).push(component)

			// Keep track of which entities have this component for future lookups
			this.componentTypesToEntities.get(component.type)
				? // We have already registered this component, add our entity to its list
				  this.componentTypesToEntities.get(component.type).push(entity)
				: // We haven't registered this component yet, register then add our entity
				  this.componentTypesToEntities.set(component.type, [entity])
		} else {
			throw `There is already a component of type ${component.type} on ${entity}`
		}
	}

	// Remove a component from a specific entity
	removeComponent = (entity: string, component: IComponent) => {
		if (this.entitiesToComponents.get(entity)) {
			// First remove the component from a given entity
			this.entitiesToComponents.set(
				entity,
				this.entitiesToComponents
					.get(entity)
					.filter((existing) => existing.type != component.type)
			)

			// Then remove the entity from the component's list of entities
			this.componentTypesToEntities.set(
				component.type,
				this.componentTypesToEntities
					.get(component.type)
					.filter((existing) => existing != entity)
			)
		} else {
			throw `Entity ${entity} does not exist`
		}
	}

	getComponent = (entity: string, type: string) => {
		if (this.entitiesToComponents.get(entity)) {
			return this.entitiesToComponents
				.get(entity)
				.find((component) => component.type === type)
		}
	}

	getComponentsByEntity = (entity: string) => {
		return this.entitiesToComponents.get(entity)
	}

	// Returns all components of a single type
	getComponentsByType = (type: string) => {
		const components = []
		const entities = this.componentTypesToEntities.get(type)

		if (entities) {
			for (let i = 0; i < entities.length; i++) {
				const component = this.getComponent(entities[i], type) // We should always only have one component per entity
				if (component) {
					components.push(component)
				}
			}
		}
		return components
	}

	getEntitiesByComponentType = (type: string) => {
		return this.componentTypesToEntities.get(type)
	}

	// Find a single entity that has a specific component
	// HACK - find a more efficient way to filter
	getEntityByComponent = (component: IComponent): string => {
		// Loop through each entity's component lists
		for (const [key, value] of this.entitiesToComponents) {
			for (let i = 0; i < value.length; i++) {
				if (value[i] === component) {
					return key
				}
			}
		}

		// we didn't find a matching component
		return undefined
	}

	// Process Systems
	addSystem = (system: ISystem) => {
		this.systems.push(system)

		// Run an awake function if we are just starting
		if (system.awake) {
			system.awake()
		}

		// Queue our start() command which will run on the next update() frame
		if (system.start) {
			this.queuedForStart.push(system)
		}
	}

	// Called every frame when system is 'active'
	update = () => {
		// First process any systems that need to 'start' (only runs once)
		while (this.queuedForStart.length > 0) {
			// Iterate through the queue and start any systems
			this.queuedForStart.shift().start()
		}

		// Run through our update loop
		for (let i = 0; i < this.systems.length; i++) {
			if (this.systems[i].update) {
				this.systems[i].update()
			}
		}
	}

	// Clean up all systems
	destroySystem = () => {
		// Shift (first to last) each system off the queue and delete them.
		while (this.systems.length > 0) {
			const system = this.systems.shift()
			if (system.destroy) {
				system.destroy()
			}
		}
	}

	// Filters - Search for entities based on a specific criteria (e.g. "get me all the entities with Transform position (3, 6)")
	// TODO - Eventually we want some sort of an interface like a 'query' that can be passed in here and would say things like "get a list of entities with node = 3 and a sprite component"
	locationFilter = (node: string) => {
		const entities: Array<string> = []
		// HACK - Filters by a specific component type and index
		// Get a list of entities with transforms
		const transformEntities = this.getEntitiesByComponentType('Transform')

		// Loop through these until you find a transform with the correct index
		for (let i = 0; i < transformEntities.length; i++) {
			const transform = this.getComponent(
				transformEntities[i],
				'transform'
			) as Transform

			// Add that entity to our list
			if (transform.node === node) {
				entities.push(transformEntities[i])
			}
		}

		return entities
	}

	// Returns a snapshot of the current state
	// Used by external functions (e.g. debugUI) to display the current state
	getDebugState = () => {
		return {
			entites: this.entities,
			entitiesToComponents: this.entitiesToComponents,
			componentTypesToEntities: this.componentTypesToEntities,
		}
	}
}
