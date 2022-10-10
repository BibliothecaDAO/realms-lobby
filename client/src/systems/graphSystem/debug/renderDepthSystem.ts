// getDepth - Map our getDepth algorithm visually
// Nodes have a unique identifier and can be clicked on to move to the next node

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../../../engine/registry'
import { COLORS } from '../../../config'

// Actions

// Components
import { Graph } from '../../../components/graph'

export class RenderDepthSystem implements ISystem {
	private ecs: Registry
	private events: Phaser.Events.EventEmitter
	private scene: Phaser.Scene

	// Gameobject that describes the current step
	public stepText: GameObjects.Text
	public queueText: GameObjects.Text

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
		this.events.on('showDepth', this.displayStep)

		this.stepText = this.scene.add.text(0, 0, '', {
			fontSize: '16px',
			color: COLORS.primary.toString(),
		})

		this.queueText = this.scene.add.text(0, 0, '', {
			fontSize: '16px',
			color: COLORS.primary.toString(),
		})
	}

	update = () => {
		//
	}

	// Event Listeners
	// Store the entity for our graph so we can pull it down when needed
	setupGraph = (entity: string) => {
		this.graphEntity = entity
	}

	displayStep = (index: number, queue: Array<number>, step: string) => {
		// HACK - to avoid passing containers around
		const xOffset = 680
		const yOffset = 320
		// Draw a bigass circle around the currently selected node
		// So we can track what's happening in our graph algo
		const graph = this.ecs.getComponent(this.graphEntity, 'graph') as Graph
		const node = graph.nodes.get(index)
		this.stepText.setPosition(xOffset + node.x, yOffset + node.y)
		this.stepText.setText(step)

		// Display the queue below our node
		const queueXOffset = 37
		const queueYOffset = 110
		this.queueText.setPosition(
			xOffset + node.x + queueXOffset,
			yOffset + node.y + queueYOffset
		)

		this.queueText.setText(queue.toString())
	}
}
