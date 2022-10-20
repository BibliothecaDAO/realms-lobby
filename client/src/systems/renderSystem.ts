// RenderSystem - Displays a dynamic object (player, enemy, door) as a sprite on the screen
// Responsible for translating Node position to screen position

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../engine/registry'
import { COLORS } from '../config'
import { getLocation } from './utils/getLocation'

// Graph
import { Node } from './graphSystem/node'

// Components
import { Graph } from '../components/graph'
import { Sprite } from '../components/sprite'
import { Transform } from '../components/transform'

export class RenderSystem implements ISystem {
	private ecs: Registry
	private events: Phaser.Events.EventEmitter
	private scene: Phaser.Scene

	// 'global' values from graph system
	private graphEntity: string

	constructor(
		events: Phaser.Events.EventEmitter,
		ecs: Registry,
		scene: Phaser.Scene
	) {
		this.events = events
		this.ecs = ecs
		this.scene = scene

		// Event Handlers
		// We received a graph from the server, parse it and calculate ndoes
		this.events.on('spawnZone', this.setupGraph)

		// Draw the entity when they first spawn
		this.events.on('spawnSuccess', this.handleSpawn)

		// Draw the entity at the current node
		this.events.on('moveAttempt', this.handleMove)
	}

	update = () => {
		//
	}

	// Event Listeners
	// Store the entity for our graph so we can pull it down when needed
	setupGraph = (entity: string) => {
		this.graphEntity = entity
	}

	handleSpawn = (entity: string) => {
		try {
			const sprite = this.ecs.getComponent(entity, 'sprite') as Sprite

			// Make sure this entity has a sprite (so we should draw it)
			if (sprite != undefined) {
				const transform = this.ecs.getComponent(
					entity,
					'transform'
				) as Transform
				if (transform != undefined) {
					this.drawSprite(entity, transform.node, sprite)
				}
			}
		} catch (e) {
			console.error(e)
		}
	}

	handleMove = (entity: string, srcNode: number, dstNode: number) => {
		try {
			const sprite = this.ecs.getComponent(entity, 'sprite') as Sprite
			// Make sure we have a sprite
			if (sprite != undefined) {
				this.drawSprite(entity, dstNode, sprite)
			} else {
				throw new Error(`Entity ${entity} does not have a sprite`)
			}
		} catch (e) {
			console.error(e)
		}
	}

	// Update a given sprite's on-screen position based on the node they occupy
	drawSprite = (entity: string, node: number, sprite: Sprite) => {
		try {
			const graph = this.ecs.getComponent(this.graphEntity, 'graph') as Graph

			if (graph != undefined) {
				if (node != undefined) {
					const location = getLocation(node, graph)

					sprite.sprite.setX(location.x).setY(location.y).setScale(4)
					sprite.sprite.setAlpha(0.6)

					// uncomment to see node indexes
					// this.debug(location.x, location.y, node.index.toString())
				} else {
					throw new Error(`No node passed in to render ${sprite.sprite}`)
				}
			} else {
				throw new Error('No graph found when drawing sprite')
			}
		} catch (e) {
			console.error(e)
		}
	}

	// Utility functions
	debug = (x: number, y: number, index: string) => {
		this.scene.add.text(x, y, index).setDepth(5)
	}
}
