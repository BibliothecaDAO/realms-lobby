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

	private nodeList: Map<number, boolean> = new Map()

	constructor(events: EventEmitter, ecs: Registry) {
		this.events = events
		this.ecs = ecs

		// Event responders
		this.events.on('moveAttempt', this.moveEntity)
		this.events.on('spawnSuccess', this.checkForDuplicates)
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
					const srcNode = transform.node
					transform.node = node
					this.events.emit('moveSuccess', entity, srcNode, transform.node)
				}
			} else {
				throw new Error('cannot load graph during move')
			}
		} else {
			throw new Error(`cannot find curent node for entity ${entity}`)
		}
	}

	// Check to make sure no entities are spawned on the same node
	// TODO: Consider moving this to a generic dataValidation System
	checkForDuplicates = (entity: string, components) => {
		let transform
		let player

		for (let i = 0; i < components.length; i++) {
			if (components[i].type == 'transform') {
				transform = components[i]
			}
			// HACK - Players can occupy the same node (?)
			if (components[i].type == 'player') {
				player == components[i]
			}
		}

		if (transform != undefined && player == undefined) {
			if (this.nodeList.get(transform.node) == undefined) {
				this.nodeList.set(transform.node, true)
			} else {
				throw new Error(`This node is alerady occupied: ${transform.node}`)
			}
		}
	}
}
