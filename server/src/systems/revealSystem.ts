// revealSystem.ts - Checks if a node is revealed. Waits for a character and reveals it.

import EventEmitter from 'events'
import { ISystem, Registry } from '../engine/registry'

// Components
import { Transform } from '../components/transform'
import { Reveal } from '../components/reveal'

export class RevealSystem implements ISystem {
	private events: EventEmitter
	private ecs: Registry

	private player: string

	constructor(events: EventEmitter, ecs: Registry) {
		this.events = events
		this.ecs = ecs

		// Listen for events
		// this.events.on('reveal', this.revealNode)
	}

	update = () => {
		// Check if we have any entities to reveal (revealed = false)
		const revealables: Array<Reveal> = this.ecs.filterRevealed(false)

		if (revealables.length > 0) {
			// Reveal 'em
			for (let i = 0; i < revealables.length; i++) {
				if (!revealables[i].revealed) {
					const entity = this.ecs.getEntityByComponent(revealables[i])
					this.revealNode(entity)
				}
			}
		}
	}

	// Event responders

	// Utility functions
	// Player is trying to move to an unrevealed node. Reveal it and spawn a mob! (and mark it as revealed)
	revealNode = (entity: string) => {
		// Get the location of this entity
		const transform: Transform = this.ecs.getComponent(
			entity,
			'transform'
		) as Transform

		// Store the node location as we're going to delete the door entity
		const node = transform.node
		this.ecs.destroyEntity(entity)
		this.events.emit('despawnSuccess', entity)

		// Pick a random monster
		// TODO - randomize monsters
		const monsterType = 'enemies/skeleton'
		// Spawn it at this location
		const monster = this.ecs.createEntity()
		// Create a custom component to pass into our spawner
		const monsterTransform = {
			type: 'transform',
			node: node,
		}

		this.events.emit('loadEntity', monster, monsterType, [transform])
	}

	// Utility functions
}
