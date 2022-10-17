// RenderSystem - Displays a dynamic object (player, enemy, door) as a sprite on the screen
// Responsible for translating Node position to screen position

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../engine/registry'
import { COLORS } from '../config'
import { getLocation } from './utils/getLocation'

// Components
import { Node } from '../components/node'
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
		const sprite = this.ecs.getComponent(entity, 'sprite') as Sprite

		// Make sure this entity has a sprite (so we should draw it)
		if (sprite != undefined) {
			const transform = this.ecs.getComponent(entity, 'transform') as Transform
			if (transform != undefined) {
				// We get a node index (e.g. 1) from the server, but we need to get the actual node object
				const graph = this.ecs.getComponent(this.graphEntity, 'graph') as Graph
				const node = graph.nodes.get(JSON.parse(transform.node))
				this.drawSprite(entity, node, sprite)
			}
		}
	}

	handleMove = (entity: string, node: string) => {
		const sprite = this.ecs.getComponent(entity, 'sprite') as Sprite
		// Make sure we have a sprite
		if (sprite != undefined) {
			this.drawSprite(entity, node, sprite)
		} else {
			throw new Error(`Entity ${entity} does not have a sprite`)
		}
	}

	// Update a given sprite's on-screen position based on the node they occupy
	drawSprite = (entity: string, nodeEntity: string, sprite: Sprite) => {
		const graph = this.ecs.getComponent(this.graphEntity, 'graph') as Graph

		if (graph != undefined) {
			const node = this.ecs.getComponent(nodeEntity, 'node') as Node

			if (node != undefined) {
				const location = getLocation(node, graph)

				// then figure out how a player moves through the scene.
				sprite.sprite.setX(location.x).setY(location.y).setScale(4)

				// uncomment to see node indexes
				// this.debug(location.x, location.y, node.index.toString())
			} else {
				throw new Error(`Node ${nodeEntity} does not exist`)
			}
		} else {
			throw new Error('No graph found when drawing sprite')
		}
	}

	// colorValidNodes = (node: number) => {
	// 	// Reset all nodes to default color
	// 	if (this.validNodeCircles.length > 0) {
	// 		for (let i = 0; i < this.validNodeCircles.length; i++) {
	// 			this.validNodeCircles[i].fillColor = COLORS.secondary.hex
	// 		}
	// 		this.validNodeCircles = []
	// 	}

	// 	// Color current circle to show it's selected
	// 	this.nodeCircles.get(node).setFillStyle(COLORS.primary.hex)

	// 	// Determine which nodes the player can move to
	// 	const graph = this.ecs.getComponent(this.graphEntity, 'graph') as Graph

	// 	// Color nodes adjacent to current node
	// 	const nextNodes = graph.adjacency.get(node)

	// 	if (nextNodes != undefined) {
	// 		for (let i = 0; i < nextNodes.length; i++) {
	// 			const circle = this.nodeCircles.get(nextNodes[i])
	// 			circle.fillColor = COLORS.primary.hex
	// 			this.validNodeCircles.push(circle)
	// 		}
	// 	}
	// }

	// Utility functions
	debug = (x: number, y: number, index: string) => {
		this.scene.add.text(x, y, index).setDepth(5)
	}
}
