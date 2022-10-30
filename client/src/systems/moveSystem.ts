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

	// Player's entity to track movement
	player: string

	adjacentNodes: Array<string> = []

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
		this.events.on('deselectNodes', this.deselectNodes)
		this.events.on('selectNode', this.selectNode)
	}

	update = () => {
		//
	}

	// Event responders
	setupPlayer = (entity: string) => {
		try {
			// Keep track of player's entity
			this.player = entity

			const playerTransform = this.ecs.getComponent(
				entity,
				'transform'
			) as Transform

			this.events.emit('selectNode', entity, null, playerTransform.node)
		} catch (e) {
			console.error(e)
		}
	}

	// Receive a valid move from the server
	validMove = (entity: string, node: number) => {
		try {
			const transform = this.ecs.getComponent(entity, 'transform') as Transform
			transform.node = node
		} catch (e) {
			console.error(e)
		}
	}

	deselectNodes = () => {
		try {
			// Disable click for our cnrrent position so we can't move to previous nodes
			this.disableClick()
		} catch (e) {
			console.error(e)
		}
	}

	selectNode = (entity: string, srcNode: number, dstNode: number) => {
		try {
			// Note: entity is null here
			const playerTransform = this.ecs.getComponent(
				this.player,
				'transform'
			) as Transform
			playerTransform.node = dstNode

			// Enable clicks for nodes adjacent to our new position
			// HACK - turning this on after animation til we find a better way
			this.enableClick(playerTransform.node)
		} catch (e) {
			console.error(e)
		}
	}

	enableClick = (node: number) => {
		try {
			const graph = this.ecs.getComponentsByType('graph')[0] as Graph

			// Grab a list of adjacent nodes
			if (node != undefined) {
				const adjacents = graph.adjacency.get(node)
				// 	// We have a path! Make 'em clickable
				if (adjacents.length > 0) {
					for (let i = 0; i < adjacents.length; i++) {
						// Find the entity from this node location (index number)
						const destNode = graph.nodes.get(adjacents[i])

						// Loop through the entities, highlight them, and highlight their paths (edges)
						const entitiesAtLocation = this.ecs.locationFilter(destNode.index)
						for (let j = 0; j < entitiesAtLocation.length; j++) {
							// Make the sprite(s) clickable, highlight colors, etc
							this.addClickableNode(entitiesAtLocation[j], destNode.index)

							// Highlight the edges as well
							this.events.emit('highlightEdge', node, adjacents[i])

							// Store this entity so we can disable it later when the player moves somewhere else
							this.adjacentNodes.push(entitiesAtLocation[j])
						}
					}
				}
			}
		} catch (e) {
			console.error(e)
		}
	}

	disableClick = () => {
		try {
			// Clear existing clickables
			this.removeClickableNode()
			this.events.emit('clearSelectedEdges')
		} catch (e) {
			console.error(e)
		}
	}

	// Utility functions
	// The player can now click to move to this destination
	addClickableNode = (entity: string, node: number) => {
		try {
			const sprite = (this.ecs.getComponent(entity, 'sprite') as Sprite).sprite

			// TODO - figure out where undefined value is throwing off animations
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
				// Grab the player's current location
				const playerTransform = this.ecs.getComponent(
					this.player,
					'transform'
				) as Transform

				// Move the player to their new location
				this.events.emit('moveAttempt', this.player, playerTransform.node, node)
				this.scene.input.setDefaultCursor('grab')
			})
		} catch (e) {
			console.error(e)
		}
	}

	// This node has been visited and is no longer interactive
	removeClickableNode = () => {
		try {
			for (let i = 0; i < this.adjacentNodes.length; i++) {
				const sprite = (
					this.ecs.getComponent(this.adjacentNodes[i], 'sprite') as Sprite
				).sprite

				sprite.clearTint()
				sprite.setAlpha(0.5)

				sprite.removeAllListeners()
			}
		} catch (e) {
			console.error(e)
		}
	}
}
