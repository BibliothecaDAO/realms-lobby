// renderEdge - Render the edges that connect nodes in the graph.
// Nodes have a unique identifier and can be clicked on to move to the next node

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../../engine/registry'

import { COLORS } from '../../config'

// Components
import { Graph } from '../../components/graph'
import { Node } from '../../components/node'

// Actions

export class RenderEdgeSystem implements ISystem {
	private ecs: Registry
	private events: Phaser.Events.EventEmitter
	private scene: Phaser.Scene

	private graphics: GameObjects.Graphics

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
		// Save graph entity info so we can reference it later
		this.events.on('spawnZone', this.setupGraph)
		// We received a graph from the server, parse it and calculate ndoes
		this.events.on('executeCreateEdge', this.drawEdge)
		this.events.on('clearCanvas', this.clearEdges)
	}

	update = () => {
		//
	}

	// Store the entity for our graph so we can pull it down when needed
	setupGraph = (entity: string) => {
		this.graphEntity = entity
		this.graphics = this.scene.add.graphics()
	}

	drawEdge = (
		src: string,
		dst: string,
		container: Phaser.GameObjects.Container
	) => {
		// Determine if edge should be visitable or disabled (grayed out)
		const srcNode = this.ecs.getComponent(src, 'node') as Node
		const dstNode = this.ecs.getComponent(dst, 'node') as Node

		// Only draw edgse that the user can move to in bright colors
		const edgeColor = COLORS.primary.hex

		// Draw our line

		this.graphics.lineStyle(2, edgeColor)
		const tmp = this.graphics.lineBetween(
			srcNode.x,
			srcNode.y,
			dstNode.x,
			dstNode.y
		)
		container.add(tmp).sendToBack(tmp) // Containers ignore setDepth so instead we send this object to the back of the queue
	}

	clearEdges = () => {
		// because we're just drawing lines, we can clear the drawbuffer
		// vs. removing every individual line
		this.graphics.clear()
	}
}
