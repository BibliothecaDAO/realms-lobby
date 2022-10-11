// Node - a single node in the graph (which is connected by edges)
// Nodes have a unique identifier and can be clicked on to move to the next node

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../../engine/registry'
import { COLORS } from '../../config'
import { Graph } from '../../components/graph'

// Actions
import { CreateNodeAction } from './debug/actions/createNodeAction'
import { DepthStepAction } from './debug/actions/depthStepAction'

// Components
import { Transform } from '../../components/transform'
import { ActionQueue } from '../../components/actionQueue'

export class RenderNodeSystem implements ISystem {
	private ecs: Registry
	private events: Phaser.Events.EventEmitter
	private scene: Phaser.Scene

	// GameObjects for all the nodes (indexed by their graph index)
	private nodeCircles: Map<number, GameObjects.Arc> = new Map()
	private nodeTexts: Map<number, GameObjects.Text> = new Map()

	// Current node the player is occupying
	private selectedNode: number
	private selectedCircle: GameObjects.Arc

	// Nodes that the player can move to from current position
	private validNodeCircles: Array<GameObjects.Arc> = []

	// 'global' values from graph system
	private graphEntity: string
	private playerEntity: string
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
		// We received a graph from the server, parse it and calculate ndoes
		this.events.on('spawnZone', this.setupGraph)
		this.events.on('setupPlayer', this.setupPlayer)
		this.events.on('enqueueCreateNode', this.enqueueCreateNode)
		this.events.on('executeCreateNode', this.drawNode)

		// Clear all nodes from the screen so we can redraw them
		// HACK - We redraw the whole screen instead of implementing an undo
		// this.events.on('clearCanvas', this.clearNodes)

		// Move the player to a new node (HACK - toggled off so we can debug the graph)
		// this.events.on('moveSuccess', this.selectNode)
		// HACK - allow us to call 'select node' from elsewhere
		this.events.on('selectNode', this.selectNode)
	}

	update = () => {
		//
	}

	// Event Listeners
	// Store the entity for our graph so we can pull it down when needed
	setupGraph = (entity: string) => {
		this.graphEntity = entity
	}

	// Select the node of the player's initial position
	setupPlayer = (entity: string) => {
		this.playerEntity = entity
		const transform = this.ecs.getComponent(entity, 'transform') as Transform

		// HACK - deselected node
		// this.selectNode(entity, transform.node)
	}

	enqueueCreateNode = (
		index: number,
		container: Phaser.GameObjects.Container
	) => {
		const actionQueue = this.ecs.getComponentsByType(
			'actionQueue'
		)[0] as ActionQueue

		// Add our node to the queue
		actionQueue.actions.push(
			new CreateNodeAction(this.events, index, container)
		)
	}

	drawNode = (index: number, container: Phaser.GameObjects.Container) => {
		const graph = this.ecs.getComponent(this.graphEntity, 'graph') as Graph

		// How far from the edge of the canvas should we draw each node?
		const xOffset = 100
		const yOffset = 100

		// Create a circle for the node
		// Spread nodes out based on depth in graph.
		// E.g. root node is at depth 0, next set of nodes is at depth 1 (to the right), etc.
		// This gives us a left -> right view of our graph.
		const depth = graph.depth.get(index)
		const x = xOffset * depth
		graph.nodes.get(index).x = x // Set the x value for the node for future use

		// Determine how many nodes we should draw at this depth
		// Space them out evenly based on the number of nodes at this depth
		// e.g. if we have 3 nodes at depth 1, we should draw them at 1/4, 2/4, and 3/4 of the canvas height

		// Get the number of nodes at this depth
		const depthList = graph.depthList.get(depth)
		const numNodesWithDepth = depthList.length

		// Determine this node's position at this depth
		const depthIndex = depthList.indexOf(index)

		// graph.reverseAdjacency.get(graph.nodes.get(index).index)
		// 	? graph.reverseAdjacency.get(graph.nodes.get(index).index).length
		// 	: 2

		// TODO - Figure out how to increment within a depth list
		const y = yOffset * (depthIndex - 1) // we subtract 1 so our graph is centered vertically
		graph.nodes.get(index).y = y

		// Save our container for future use
		if (!this.container) {
			this.container = container
		}

		// Draw the circular background
		const circle = this.scene.add.circle(x, y, 30, COLORS.secondary.hex)
		this.nodeCircles.set(index, circle)
		container.add(circle)

		// Let the user click on the newly created circle (to move there)
		this.enableClick(index, circle)

		// Draw the node number
		const text = this.scene.add
			.text(x, y, index.toString(), { color: 'white' })
			.setOrigin(0.5)
			.setFontSize(20)
		this.nodeTexts.set(index, text)
		container.add(text)
	}

	clearNodes = () => {
		for (const [key, value] of this.nodeCircles) {
			this.nodeCircles.get(key).destroy()
		}

		for (const [key, value] of this.nodeTexts) {
			this.nodeTexts.get(key).destroy()
		}
	}

	selectNode = (uid: string, index: number) => {
		const graph = this.ecs.getComponent(this.graphEntity, 'graph') as Graph
		if (graph != undefined) {
			// Remove old selection
			if (this.selectedCircle) {
				this.selectedCircle.destroy()
			}

			// Determine where we should draw our selection
			const circle = this.nodeCircles.get(index)

			// Draw the a circle around the currently selected node
			this.selectedCircle = this.scene.add
				.circle(circle.x, circle.y, 36, 0x000000, 0)
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
	}

	enableClick = (index: number, circle: GameObjects.Arc) => {
		circle.setInteractive()
		circle.on('pointerover', () => {
			circle.setAlpha(0.8)
			this.scene.input.setDefaultCursor('pointer')
		})

		circle.on('pointerout', () => {
			circle.setAlpha(1)
			this.scene.input.setDefaultCursor('default')
		})

		circle.on('pointerup', () => {
			this.events.emit('moveAttempt', index)
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
	bfs = (index: number, graph) => {
		// TODO debug this

		const root = 0
		const adj = graph.adjacency[index]

		const queue = []
		queue.push(root)

		const discovered = []
		discovered[root] = true

		while (queue.length) {
			const v = queue.shift()

			if (v === index) {
				return true
			}

			for (let i = 0; i < adj[v].length; i++) {
				if (!discovered[adj[v][i]]) {
					discovered[adj[v][i]] = true
					queue.push(adj[v][i])
				}
			}
		}

		return false
	}
}
