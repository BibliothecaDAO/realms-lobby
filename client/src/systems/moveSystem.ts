// moveSystem.ts - Move things (e.g. characters) around the map
// Authoritative moves come down from the server via events (handled by the 'connection' class)
// Client can send moveRequests to the server which will then send back a validMove event.

import { ISystem, Registry } from '../engine/registry'
import { COLORS } from '../config'

// Components
import { Transform } from '../components/transform'
import { Graph } from '../components/graph'
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
		// const transforms = this.ecs.getComponentsByType(
		// 	'transform'
		// ) as Array<Transform>

		// for (let i = 0; i < transforms.length; i++) {
		// 	transforms[i].node = graph.nodes.get(JSON.parse(transforms[i].node))
		// }

		this.events.emit('selectNode', entity, this.transform.node)
	}

	// Receive a valid move from the server
	validMove = (entity: string, node: number) => {
		const transform = this.ecs.getComponent(entity, 'transform') as Transform
		transform.node = node
	}

	selectNode = (entity: string, node: number) => {
		// TODO - Check if the move is valid

		// Disable click for our cnrrent position so we can't move to previous nodes
		// this.disableClick(this.transform.node)

		// Note: entity is null here
		this.transform.node = node

		// Enable clicks for nodes adjacent to our new position
		this.enableClick(this.transform.node)
	}

	enableClick = (node: number) => {
		const graph = this.ecs.getComponentsByType('graph')[0] as Graph

		// // TODO - Figure out why enabling this block causes the whole canvas to shift to the top left corner
		// // Grab a list of adjacent nodes
		if (node != undefined) {
			const adjacents = graph.adjacency.get(node)
			// 	// We have a path! Make 'em clickable
			if (adjacents.length > 0) {
				for (let i = 0; i < adjacents.length; i++) {
					// Find the entity from this node location (index number)
					const node = graph.nodes.get(adjacents[i])

					// Loop through the entities, highlight them, and highlight their paths (edges)
					const entitiesAtLocation = this.ecs.locationFilter(node.index)
					for (let j = 0; j < entitiesAtLocation.length; j++) {
						// Make the sprite(s) clickable, highlight colors, etc
						this.makeNodeVisitable(entitiesAtLocation[j])
						// this.events.emit('selectPath', nodeEntity, entitiesAtLocation[j])
					}
				}
			}
		}
	}

	// Utility functions
	makeNodeVisitable = (node: string) => {
		const sprite = (this.ecs.getComponent(node, 'sprite') as Sprite).sprite

		sprite.setTintFill(COLORS.primary.hex)
		sprite.setAlpha(1)

		sprite.setInteractive()
		sprite.on('pointerover', () => {
			sprite.setTintFill(0xffffff)
			this.scene.input.setDefaultCursor('pointer')
		})
		sprite.on('pointerout', () => {
			sprite.setTintFill(COLORS.primary.hex)
			this.scene.input.setDefaultCursor('grab')
		})
		sprite.on('pointerup', () => {
			// HACK - our original 'moveAttempt' passed one command: index
			this.events.emit('moveAttempt', null, node)
			this.scene.input.setDefaultCursor('grab')
		})
	}
}
