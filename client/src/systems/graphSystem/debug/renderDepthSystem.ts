// getDepth - Map our getDepth algorithm visually
// Nodes have a unique identifier and can be clicked on to move to the next node

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../../../engine/registry'
import { COLORS } from '../../../config'
import { Graph } from '../../../components/graph'
import { Node } from '../node'
import _ from 'lodash'

// Actions
import { DepthStepAction } from './actions/depthStepAction'

// Components
import { ActionQueue } from '../../../components/actionQueue'

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
		this.events.on('getDepth', this.getDepth)
		this.events.on('clearCanvas', this.clearNodes)
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

	getDepth = (node: Node, graph: Graph) => {
		const start = 0 // We always start at position zero
		let depth = 0 // Keep track of the depth we've traversed

		const visited = new Set()
		const queue = [start]
		// ACTION - Started search
		// We need to use cloneDeep because the array changes value during our delayed queue
		this.queueStep(node.index, _.cloneDeep(queue), '  start')

		while (queue.length > 0) {
			this.queueStep(node.index, _.cloneDeep(queue), `shift: ${queue[0]}`)
			const _node = queue.shift()
			if (_node === node.index) {
				// ACTION - Found depth
				this.queueStep(node.index, _.cloneDeep(queue), `found: ${depth}`)
				return depth
			}

			const neighbors = graph.adjacency.get(_node)

			if (neighbors) {
				for (let i = 0; i < neighbors.length; i++) {
					if (!visited.has(neighbors[i])) {
						// ACTION - AddNeighborToQueue
						depth++
						visited.add(neighbors[i])
						this.queueStep(
							node.index,
							_.cloneDeep(queue),
							`unshift: ${neighbors[i]}`
						)
						queue.unshift(neighbors[i])
					}
				}
			} else {
				// We didn't encounter a subgraph so we should backtrack
				depth--
			}
		}

		return depth
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

		console.log('setText')
		console.log(queue)
		this.queueText.setText(queue.toString())
	}

	// Reset our text box's contents
	clearNodes = () => {
		// this.depthText.setText('')
	}

	// Queues up an action
	queueStep = (index: number, queue: Array<number>, step: string) => {
		const actionQueue = this.ecs.getComponentsByType(
			'actionQueue'
		)[0] as ActionQueue

		console.log('step')
		console.log(queue)
		// Add our node to the queue
		actionQueue.actions.push(
			new DepthStepAction(this.events, index, queue, step)
		)
	}
}
