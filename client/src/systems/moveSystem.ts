// moveSystem.ts - Move things (e.g. characters) around the map
// Authoritative moves come down from the server via events (handled by the 'connection' class)
// Client can send moveRequests to the server which will then send back a validMove event.

import { ISystem, Registry } from '../engine/registry'

// Components
import { Transform } from '../components/transform'
import { Zone } from '../components/zone'

export class MoveSystem implements ISystem {
	private events: Phaser.Events.EventEmitter
	private ecs: Registry

	constructor(events: Phaser.Events.EventEmitter, ecs: Registry) {
		this.events = events
		this.ecs = ecs

		// Listen for events
		// Move the character to anohter position on the map
		this.events.on('moveSuccess', this.validMove)
	}

	update = () => {
		//
	}

	// Event responders
	// Receive a valid move from the server
	validMove = (entity: string, node: number) => {
		const transform = this.ecs.getComponent(entity, 'transform') as Transform
		transform.node = node
	}

	// Utility functions
}
