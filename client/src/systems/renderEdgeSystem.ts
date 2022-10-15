// renderEdge - Render the edges that connect nodes in the graph.
// Nodes have a unique identifier and can be clicked on to move to the next node

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../engine/registry'
import { COLORS } from '../config'

import { getLocation } from './utils/getLocation'

// Components
import { Graph } from '../components/graph'
import { Node } from '../components/node'

// Actions

export class RenderEdgeSystem implements ISystem {
	private ecs: Registry
	private events: Phaser.Events.EventEmitter
	private scene: Phaser.Scene

	private graphics: GameObjects.Graphics

	// 'global' values from graph system
	private graph: Graph

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
		this.events.on('graphReady', this.drawEdges)
		this.events.on('clearCanvas', this.clearEdges)
	}

	update = () => {
		//
	}

	drawEdges = (entity: string, graph: Graph) => {
		this.graphics = this.scene.add.graphics()

		for (let i = 0; i < graph.edges.length; i++) {
			// Determine if edge should be visitable or disabled (grayed out)
			const srcNodeId = graph.edges[i].src_identifier

			const srcNode = this.ecs.getComponent(
				graph.nodes.get(srcNodeId),
				'node'
			) as Node

			const dstNodeId = graph.edges[i].dst_identifier
			const dstNode = this.ecs.getComponent(
				graph.nodes.get(dstNodeId),
				'node'
			) as Node

			// Get locations of each node
			const srcLocation = getLocation(srcNode, graph)
			const dstLocation = getLocation(dstNode, graph)

			// Only draw edgse that the user can move to in bright colors
			const edgeColor = COLORS.primary.hex

			// Draw our line
			this.graphics.lineStyle(2, edgeColor)
			const tmp = this.graphics
				.lineBetween(srcLocation.x, srcLocation.y, dstLocation.x, dstLocation.y)
				.setDepth(1)
				.setAlpha(0.2)
		}
	}

	clearEdges = () => {
		// because we're just drawing lines, we can clear the drawbuffer
		// vs. removing every individual line
		this.graphics.clear()
	}
}
