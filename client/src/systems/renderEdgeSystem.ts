// renderEdge - Render the edges that connect nodes in the graph.
// Nodes have a unique identifier and can be clicked on to move to the next node

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../engine/registry'
import { COLORS } from '../config'

import { getLocation } from './utils/getLocation'

// Components
import { Graph } from '../components/graph'

export class RenderEdgeSystem implements ISystem {
	private ecs: Registry
	private events: Phaser.Events.EventEmitter
	private scene: Phaser.Scene

	private edges: GameObjects.Graphics
	private selectedEdges: GameObjects.Graphics

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
		this.events.on('highlightEdge', this.highlightEdge)
		this.events.on('clearCanvas', this.clearEdges)
		this.events.on('clearSelectedEdges', this.clearSelectedEdges)

		this.edges = this.scene.add.graphics()
		this.selectedEdges = this.scene.add.graphics()
	}

	update = () => {
		//
	}

	drawEdges = (entity: string, graph: Graph) => {
		try {
			// store graph for future use
			this.graph = graph

			for (let i = 0; i < graph.edges.length; i++) {
				// Determine if edge should be visitable or disabled (grayed out)
				const src = graph.edges[i].src_identifier

				const dst = graph.edges[i].dst_identifier

				// Get locations of each node
				const srcLocation = getLocation(src, graph)
				const dstLocation = getLocation(dst, graph)

				// Only draw edgse that the user can move to in bright colors
				const edgeColor = COLORS.primary.hex

				// Draw our line
				this.edges
					.lineStyle(2, edgeColor)
					.lineBetween(
						srcLocation.x,
						srcLocation.y,
						dstLocation.x,
						dstLocation.y
					)
					.setDepth(1)
					.setAlpha(0.2)
			}
		} catch (error) {
			console.log(error)
		}
	}

	// Highlight an edge so a user can see where they can move to
	highlightEdge = (srcIndex: number, dstIndex: number) => {
		try {
			const srcLocation = getLocation(srcIndex, this.graph)
			const dstLocation = getLocation(dstIndex, this.graph)

			this.selectedEdges
				.lineStyle(3, COLORS.primary.hex)
				.lineBetween(srcLocation.x, srcLocation.y, dstLocation.x, dstLocation.y)
				.setDepth(1)
				.setAlpha(1)
		} catch (error) {
			console.error(error)
		}
	}

	clearEdges = () => {
		// because we're just drawing lines, we can clear the drawbuffer
		// vs. removing every individual line
		this.edges.clear()
	}

	clearSelectedEdges = () => {
		console.log('got here')
		// wipe the drawbuffer for selected edges
		this.selectedEdges.clear()
	}
}
