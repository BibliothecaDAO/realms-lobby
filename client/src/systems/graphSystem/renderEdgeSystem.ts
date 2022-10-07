// renderEdge - Render the edges that connect nodes in the graph.
// Nodes have a unique identifier and can be clicked on to move to the next node

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../../engine/registry'

import { Node } from './node'
import { COLORS } from '../../config'

// Components
import { Graph } from '../../components/graph'

export class RenderEdgeSystem implements ISystem {
	private ecs: Registry
	private events: Phaser.Events.EventEmitter
	private scene: Phaser.Scene

	private nodeCircles: Map<number, GameObjects.Arc> = new Map()
	private selectedNode: number
	private selectedCircle: GameObjects.Arc

	// 'global' values from graph system
	private graphEntity: string
	private container: GameObjects.Container

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
		this.events.on('createEdge', this.drawEdge)
	}

	update = () => {
		//
	}

	// Store the entity for our graph so we can pull it down when needed
	setupGraph = (entity: string) => {
		this.graphEntity = entity
	}

	drawEdge = (
		src: Node,
		dst: Node,
		container: Phaser.GameObjects.Container
	) => {
		// Determine if edge should be visitable or disabled (grayed out)
		const graph = this.ecs.getComponent(this.graphEntity, 'graph') as Graph

		// Only draw edgse that the user can move to in bright colors
		const edgeColor = COLORS.primary.hex

		// Draw our line
		const graphics = this.scene.add.graphics()
		graphics.lineStyle(2, 0xffffff)
		const tmp = graphics.lineBetween(src.x, src.y, dst.x, dst.y)
		container.add(tmp).sendToBack(tmp) // Containers ignore setDepth so instead we send this object to the back of the queue
	}
}
