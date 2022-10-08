// Node - a single node in the graph (which is connected by edges)
// Nodes have a unique identifier and can be clicked on to move to the next node

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../../engine/registry'
import { COLORS } from '../../config'
import { Graph } from '../../components/graph'
import { Node } from './node'

// Components
import { Transform } from '../../components/transform'

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
		this.events.on('executeCreateNode', this.drawNode)
		this.events.on('clearCanvas', this.clearNodes)

		this.events.on('moveSuccess', this.selectNode)
	}

	update = () => {
		//
	}

	// Store the entity for our graph so we can pull it down when needed
	setupGraph = (entity: string) => {
		this.graphEntity = entity
	}

	// Select the node of the player's initial position
	setupPlayer = (entity: string) => {
		this.playerEntity = entity
		const transform = this.ecs.getComponent(entity, 'transform') as Transform
		this.selectNode(entity, transform.node)
	}

	drawNode = (index: number, container: Phaser.GameObjects.Container) => {
		const graph = this.ecs.getComponent(this.graphEntity, 'graph') as Graph

		// How far from the edge of the canvas should we draw each node?
		const xOffset = 100
		const yOffset = 100

		// Create a circle for the node
		// Calculate the depth of the node
		const depth = this.getDepth(graph.nodes.get(index), graph)

		const x = xOffset * depth
		graph.nodes.get(index).x = x

		// Calculate how many edges each node has - more edges means it gets drawn further down the screen
		const numEdges = graph.reverseAdjacency.get(graph.nodes.get(index).index)
			? graph.reverseAdjacency.get(graph.nodes.get(index).index).length
			: 2

		const y = yOffset * (numEdges - 1) // we subtract 1 so our graph is centered vertically
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

		// TODO - Make sure this renders correctly
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
			this.colorValidNodes(index)
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
	// Returns the depth of a given node (via BFS)
	getDepth = (node: Node, graph) => {
		const start = 0 // We always start at position zero
		let depth = 0 // Keep track of the depth we've traversed

		const visited = new Set()
		const queue = [start]

		while (queue.length > 0) {
			const _node = queue.shift()
			if (_node === node.index) {
				return depth
			}

			const neighbors = graph.adjacency.get(_node)
			if (neighbors) {
				for (let i = 0; i < neighbors.length; i++) {
					if (!visited.has(neighbors[i])) {
						// We found a new node, add it to the queue
						depth++
						visited.add(neighbors[i])
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
}
