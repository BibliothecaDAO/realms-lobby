// moveSystem.ts - Move things (e.g. characters) around the map
// Client sends potential moves, server validates them and responds w/ a validMove
// Client can send moveRequests to the server which will then send back a validMove event.

import EventEmitter from 'events'
import { ISystem, Registry } from '../engine/registry'

// Components
import { Transform } from '../components/transform'
import { Graph } from '../components/graph'

export class MoveSystem implements ISystem {
	private events: EventEmitter
	private ecs: Registry

	constructor(events: EventEmitter, ecs: Registry) {
		this.events = events
		this.ecs = ecs

		// Event responders
		this.events.on('moveAttempt', this.moveEntity)
	}

	update = () => {
		//
	}

	// Utility functions
	// Process a move for a player to an adjacent node
	moveEntity = (entity: string, node: number) => {
		// Keep track of current location to calculate if this is a valid move
		const transform = this.ecs.getComponent(entity, 'transform') as Transform

		if (transform.node != undefined) {
			// Calculate valid move
			const graph = this.ecs.getComponentsByType('graph')[0] as Graph

			if (graph != undefined) {
				const currentNode = graph.adjacency.get(transform.node)
				// Make sure the node is adjacent to the current node
				if (currentNode && currentNode.includes(node)) {
					transform.node = node
					this.events.emit('moveSuccess', entity, node)
				}
			} else {
				throw new Error('cannot load graph during move')
			}
		} else {
			throw new Error(`cannot find curent node for entity ${entity}`)
		}
	}
}
