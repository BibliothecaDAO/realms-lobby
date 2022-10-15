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

	// GameObjects for all the nodes (indexed by their graph index)
	private nodeCircles: Map<number, GameObjects.Arc> = new Map()
	private nodeTexts: Map<number, GameObjects.Text> = new Map()

	// Current node the player is occupying
	private selectedCircle: GameObjects.Arc

	// Nodes that the player can move to from current position
	private validNodeCircles: Array<GameObjects.Arc> = []

	// 'global' values from graph system
	private graphEntity: string
	private container: GameObjects.Container

	constructor(
		events: Phaser.Events.EventEmitter,
		ecs: Registry,
		scene: Phaser.Scene,
		container: GameObjects.Container
	) {
		this.events = events
		this.ecs = ecs
		this.scene = scene
		this.container = container

		// Event Handlers
		// We received a graph from the server, parse it and calculate ndoes
		this.events.on('spawnZone', this.setupGraph)
		// this.events.on('executeCreateNode', this.drawSprite)
		this.events.on('setupPlayer', this.setupPlayer)

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

	setupPlayer = (entity: string) => {
		const graph = this.ecs.getComponent(this.graphEntity, 'graph') as Graph
		const node = graph.nodes.get(0)
		this.selectNode(null, node)
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
				this.container.add(sprite.sprite)
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

				// TODO - figure out why none of these objects are drawing to scene
				sprite.sprite.setX(location.x).setY(location.y).setScale(4)

				// this.container.add(sprite.sprite)
				// this.container.add(rect)

				// // Draw the circular background
				// const circle = this.scene.add.circle(
				// 	location.x,
				// 	location.y,
				// 	30,
				// 	COLORS.secondary.hex
				// )
				// this.nodeCircles.set(node.index, circle)
				// this.container.add(circle)

				// Let the user click on the newly created circle (to move there)
				// this.enableClick(entity, circle)

				// Draw the node number
				// const text = this.scene.add
				// 	.text(location.x, location.y, node.index.toString(), {
				// 		color: 'white',
				// 	})
				// 	.setOrigin(0.5)
				// 	.setFontSize(20)
				// this.nodeTexts.set(node.index, text)
				// this.container.add(text)
			} else {
				throw new Error(`Node ${nodeEntity} does not exist`)
			}
		} else {
			throw new Error('No graph found when drawing sprite')
		}
	}

	clearNodes = () => {
		for (const [key, value] of this.nodeCircles) {
			this.nodeCircles.get(key).destroy()
		}

		for (const [key, value] of this.nodeTexts) {
			this.nodeTexts.get(key).destroy()
		}
	}

	selectNode = (uid: string, entity: string) => {
		// Remove old selection
		if (this.selectedCircle) {
			this.selectedCircle.destroy()
		}

		// Determine where we should draw our selection
		const node = this.ecs.getComponent(entity, 'node') as Node

		// Draw the a circle around the currently selected node
		this.selectedCircle = this.scene.add
			.circle(node.x, node.y, 36, 0x000000, 0)
			.setStrokeStyle(2, COLORS.primary.hex, 1) // To draw a circle w/o fill, we set fill alpha to 0 and add a stroke
		this.container.add(this.selectedCircle)

		// Node selector should pulse to indicate it's selected
		this.scene.tweens.add({
			targets: this.selectedCircle,
			alpha: { value: 0.3, duration: 600 },
			ease: 'Sine.easeInOut',
			yoyo: true,
			loop: -1,
		})

		// Color other nodes so player knows where they can go
		// HACK - Commented this out so we could override node colors for debugging getDepth
		// this.colorValidNodes(index)
	}

	enableClick = (entity: string, circle: GameObjects.Arc) => {
		circle.setInteractive()
		circle.on('pointerover', () => {
			circle.setAlpha(0.8)
			this.scene.input.setDefaultCursor('pointer')
		})

		circle.on('pointerout', () => {
			circle.setAlpha(1)
			this.scene.input.setDefaultCursor('grab')
		})

		circle.on('pointerup', () => {
			// HACK - our original 'moveAttempt' passed one command: index
			this.events.emit('moveAttempt', null, entity)
			this.scene.input.setDefaultCursor('grab')
		})
	}

	colorValidNodes = (node: number) => {
		// Reset all nodes to default color
		if (this.validNodeCircles.length > 0) {
			for (let i = 0; i < this.validNodeCircles.length; i++) {
				this.validNodeCircles[i].fillColor = COLORS.secondary.hex
			}
			this.validNodeCircles = []
		}

		// Color current circle to show it's selected
		this.nodeCircles.get(node).setFillStyle(COLORS.primary.hex)

		// Determine which nodes the player can move to
		const graph = this.ecs.getComponent(this.graphEntity, 'graph') as Graph

		// Color nodes adjacent to current node
		const nextNodes = graph.adjacency.get(node)

		if (nextNodes != undefined) {
			for (let i = 0; i < nextNodes.length; i++) {
				const circle = this.nodeCircles.get(nextNodes[i])
				circle.fillColor = COLORS.primary.hex
				this.validNodeCircles.push(circle)
			}
		}
	}

	// Utility functions
}
