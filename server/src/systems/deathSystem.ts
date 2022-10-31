// deathSystem.ts - When an entity's HP <0, it dies

import EventEmitter from 'events'
import { ISystem, Registry } from '../engine/registry'

// Components
import { Health } from '../components/health'

export class DeathSystem implements ISystem {
	private events: EventEmitter
	private ecs: Registry

	constructor(events: EventEmitter, ecs: Registry) {
		this.events = events
		this.ecs = ecs

		// Listen for events
	}

	update = () => {
		// Query all of the entities with a health component
		const livingEntities = this.ecs.getEntitiesByComponentType('health')
		if (livingEntities != undefined) {
			livingEntities.forEach((entity) => {
				const health = this.ecs.getComponent(entity, 'health') as Health

				// If an entity dies, remove it from the game
				if (health.amount <= 0) {
					// Call the despawn system so we can remove the entity from the game
					this.events.emit('despawnAttempt', entity)
				}
			})
		}
	}

	// Event responders

	// Utility functions
}
