// moveSystem.ts - Move things (e.g. characters) around the map
// Authoritative moves come down from the server via events (handled by the 'connection' class)
// Client can send moveRequests to the server which will then send back a validMove event.

import { ISystem, Registry } from '../engine/registry'

// Components
import { Transform } from '../components/transform'
import { Graph } from '../components/graph'
import { Node } from '../components/node'
import { Sprite } from '../components/sprite'

export class MoveSystem implements ISystem {
	private events: Phaser.Events.EventEmitter
	private ecs: Registry
	private scene: Phaser.Scene

	// Player's transform to track movement
	transform: Transform

	constructor(
		events: Phaser.Events.EventEmitter,
		ecs: Registry,
		scene: Phaser.Scene
	) {
		this.events = events
		this.ecs = ecs
		this.scene = scene

		// Listen for events
		this.events.on('setupPlayer', this.setupPlayer)
		// Move the character to anohter position on the map
		// this.events.on('moveSuccess', this.validMove)
		// HACK - Listen for client-side moves for now
		this.events.on('selectNode', this.selectNode)
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

		this.events.emit('selectNode', entity, this.transform.node)
	}

	// Receive a valid move from the server
	validMove = (entity: string, node: string) => {
		const transform = this.ecs.getComponent(entity, 'transform') as Transform
		transform.node = node
	}

	selectNode = (entity: string, node: string) => {
		// TODO - Check if the move is valid

		// Disable click for our cnrrent position so we can't move to previous nodes
		// this.disableClick(this.transform.node)

		// Note: entity is null here
		this.transform.node = node

		// Enable clicks for nodes adjacent to our new position
		this.enableClick(this.transform.node)
	}

	enableClick = (nodeEntity: string) => {
		const graph = this.ecs.getComponentsByType('graph')[0] as Graph
		// // Derive index for node from its entity
		let index
		for (const [key, value] of graph.nodes) {
			if (value == nodeEntity) {
				index = key
			}
		}
		// // TODO - Figure out why enabling this block causes the whole canvas to shift to the top left corner
		// // Grab a list of adjacent nodes
		if (index != undefined) {
			const adjacents = graph.adjacency.get(index)
			// 	// We have a path! Make 'em clickable
			if (adjacents.length > 0) {
				for (let i = 0; i < adjacents.length; i++) {
					// Find the entity whose location is this node
					// TODO write a basic filter system
					// TODO - Figure out why the hell locations are getting reset to top left of map

					const node = graph.nodes.get(adjacents[i])
					// const entitiesAtLocation = this.ecs.locationFilter(node)
					// for (let i = 0; i < entitiesAtLocation.length; i++) {
					// 	// const sprite = this.ecs.getComponent(
					// 	// 	entitiesAtLocation[i],
					// 	// 	'sprite'
					// 	// ) as Sprite
					// 	// sprite.sprite.setInteractive()
					// 	// sprite.sprite.on('pointerdown', () => {
					// 	// 	this.events.emit('moveAttempt', entitiesAtLocation[i], node)
					// 	// })
					// }

					// const sprite = this.ecs.getComponent(node, 'sprite') as Sprite
					// const _sprite = sprite.sprite
					// sprite.sprite.setInteractive()
					// 			sprite.on('pointerover', () => {
					// 				sprite.setAlpha(0.8)
					// 				this.scene.input.setDefaultCursor('pointer')
					// 			})
					// 			sprite.on('pointerout', () => {
					// 				sprite.setAlpha(1)
					// 				this.scene.input.setDefaultCursor('grab')
					// 			})
					// 			sprite.on('pointerup', () => {
					// 				// HACK - our original 'moveAttempt' passed one command: index
					// 				this.events.emit('moveAttempt', null, node)
					// 				this.scene.input.setDefaultCursor('grab')
					// 			})
				}
			}
		}
	}

	// Utility functions
}
