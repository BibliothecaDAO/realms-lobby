// moveSystem.ts - Move things (e.g. characters) around the map
// Authoritative moves come down from the server via events (handled by the 'connection' class)
// Client can send moveRequests to the server which will then send back a validMove event.

import { ISystem, Registry } from '../engine/registry'

// Components
import { Transform } from '../components/transform'
import { Graph } from '../components/graph'

export class MoveSystem implements ISystem {
	private events: Phaser.Events.EventEmitter
	private ecs: Registry

	// Player's transform to track movement
	transform: Transform

	constructor(events: Phaser.Events.EventEmitter, ecs: Registry) {
		this.events = events
		this.ecs = ecs

		// Listen for events
		this.events.on('setupPlayer', this.setupPlayer)
		// Move the character to anohter position on the map
		// this.events.on('moveSuccess', this.validMove)
		// HACK - Listen for client-side moves for now
		// this.events.on('selectNode', this.selectNode)
		this.events.on('moveAttempt', this.selectNode)
	}

	update = () => {
		//
	}

	// Event responders
	setupPlayer = (entity: string) => {
		this.transform = this.ecs.getComponent(entity, 'transform') as Transform

		const graph = this.ecs.getComponentsByType('graph')[0] as Graph

		// Hack - convert all nodes to entities
		const transforms = this.ecs.getComponentsByType(
			'transform'
		) as Array<Transform>

		for (let i = 0; i < transforms.length; i++) {
			transforms[i].node = graph.nodes.get(JSON.parse(transforms[i].node))
		}

		// TODO - Spawn skeleton and player on node
		// Replace all other nodes with doors
	}

	// Receive a valid move from the server
	validMove = (entity: string, node: string) => {
		const transform = this.ecs.getComponent(entity, 'transform') as Transform
		transform.node = node
	}

	selectNode = (entity: string, node: string) => {
		// Note: entity is null here
		this.transform.node = node
	}

	// Utility functions
}
