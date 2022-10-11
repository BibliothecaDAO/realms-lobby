// SpawnSystem - Listens for spawn commands (e.g. when zone loads monster respawns, player connects) and creates a new entity accordingly

import { IComponent, ISystem } from '../engine/registry'
import EventEmitter from 'events'
import { Registry } from '../engine/registry'

// Deep Cloning objects
import * as _ from 'lodash'

// Hardcode components for our lookup table - typescript doesn't like importing generic components
import { Inventory } from '../components/inventory'
import { Sprite } from '../components/sprite'
import { Transform } from '../components/transform'
import { Zone } from '../components/zone'

interface gameObject {
	[key: string]: IComponent
}

export class SpawnSystem implements ISystem {
	private events: EventEmitter
	private ecs: Registry

	// HACK - store entity / component map so we can re-spawn specific entities
	// Otherwise we can only call the template which won't have overridden data
	private entities: Map<string, gameObject> = new Map()

	constructor(events: EventEmitter, ecs: Registry) {
		this.events = events
		this.ecs = ecs

		this.events.on('spawnAttempt', this.handleSpawn)
		this.events.on('respawnAttempt', this.handleRespawn)
		this.events.on('despawnAttempt', this.handleDespawn)
	}

	update = () => {
		//
	}

	// Event Handlers
	handleSpawn = (entity: string, components) => {
		// If no entity is passed in (null), ecs registry will generate a new one
		entity = this.ecs.createEntity(entity)

		const componentsToSend = {} // temporary variable to format our data for sending to the client. Expects an object w/ keys for each component name.

		for (let i = 0; i < components.length; i++) {
			let component
			// Determine which type of component to create
			// Hacky lookup table for our components
			switch (components[i].type) {
			case 'inventory':
				component = new Inventory(components[i].items)
				break
			case 'sprite':
				component = new Sprite(components[i].name)
				break
			case 'transform':
				component = new Transform(components[i].node)
				break
			case 'zone':
				component = new Zone(components[i].seed, components[i].length)
				break
			default:
				throw new Error(`component '${components[i].type}' not found`)
			}
			this.ecs.addComponent(entity, component)

			// Only show components that we should be exposing to the client
			if (!component.hidden) {
				componentsToSend[components[i].type] = component
			}

			// HACK - special case zone spawn so the client can load pathfinding and tilemaps
			// Otherwise the zone component has to query every time anything spawns
			if (component.type == 'zone') {
				this.events.emit('spawnZone', entity, component)
			}
		}

		// HACK - Cache the entity and its components in case we need to respawn them
		// We have to deep clone this entity, otherwise the inventory will be cleared when it gets chopped down (Because stored by reference)
		this.entities.set(entity, this.clone(components))

		// TODO - Reeconcile this function with our 'getState' which dumps the state to clients
		const componentString = JSON.stringify(componentsToSend)
		this.events.emit('spawnSuccess', entity, componentString)
	}

	// // respawn happens after a respawnTimer counts down. Entity should be 'restarted' with its original state
	handleRespawn = (entity: string) => {
		const components = this.entities.get(entity)

		// Kick off a new spawn process for this entity.
		this.events.emit('spawnAttempt', null, components) // We pass in null so we get a fresh entity id

		// Remove the entity from our cache, ecs, etc.
		this.handleDespawn(entity)
	}

	// Utility Functions
	// despawn happens when an entity is removed from the game (e.g. player disconnects)
	handleDespawn = (entity: string) => {
		this.ecs.destroyEntity(entity)
		this.entities.delete(entity)
		this.events.emit('despawnSuccess', entity)
	}

	// Deep Copy a object (e.g. if we want to pluck a template)
	clone = (value) => {
		return _.cloneDeep(value, true)
	}
}
