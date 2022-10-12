// graphSystem - Loads a graph, parses it, and traverses it
// Returns an object that can be sent to the client and displayed

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../../engine/registry'

import _ from 'lodash'

// Components
import { Zone } from '../../components/zone'
import { Graph } from '../../components/graph'
import { ActionQueue } from '../../components/actionQueue'

// Graph data structures
import { Edge } from './edge'
import { Node } from './node'

// Actions
import { DepthStepAction } from './debug/actions/depthStepAction'

export class GraphSystem implements ISystem {
	private events: Phaser.Events.EventEmitter
	private ecs: Registry
	private scene: Phaser.Scene
	public type = 'graphSystem'

	// Graph data
	public graphEntity: string

	// Game Objects
	public container: GameObjects.Container

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

		// Create area where we'll draw our graph
		this.container = this.scene.add.container(
			this.scene.cameras.main.centerX,
			this.scene.cameras.main.centerY
		)
	}

	update = () => {
		//
	}

	// Instantiates edges and prepares to traverse them
	setupGraph = (entity: string, component: Zone): void => {
		const edges: Edge[] = []

		// HACK - plug in tmp variable
		component.graph = [
			[0, 1, 1],
			[1, 2, 1],
			[2, 3, 1],
			[3, 4, 1],
			[4, 5, 1],
			[5, 6, 1],
			[6, 7, 1],
			[7, 8, 1],
			[8, 9, 1],
			[9, 10, 1],
			[10, 11, 1],
			[3, 300, 1],
			[300, 301, 1],
			[301, 302, 1],
			[302, 0, 1],
			[8, 800, 1],
			[800, 801, 1],
			[801, 802, 1],
			[802, 803, 1],
			[803, 804, 1],
			[804, 805, 1],
			[805, 806, 1],
			[806, 807, 1],
			[807, 2, 1],
			[2, 200, 1],
			[200, 201, 1],
			[201, 202, 1],
			[202, 203, 1],
			[203, 204, 1],
			// [204, 0, 1],
		]

		// Get list of edges
		for (let i = 0; i < component.graph.length; i++) {
			const edge = new Edge(
				component.graph[i][0],
				component.graph[i][1],
				component.graph[i][2]
			)
			// Add edge to graph
			edges.push(edge)
		}

		const graph = new Graph(edges)
		this.graphEntity = entity
		this.ecs.addComponent(entity, graph)

		// Get Adjacency List & reverse Adjacency List for all nodes (so we can calculate nodes and edges)
		this.getAdjacencyList(graph)

		// Identify nodes via depth first search
		this.depthFirst(graph)

		// Calculate depths for each node (so we can space them out horizontally / vertically)
		this.getDepths(graph)

		// Calculate a depth list so we know how many nodes are at a given depth (and can space them vertically)
		this.getDepthList(graph)

		// Draw our nodes
		this.drawNodes(graph)
		// Draw edges between nodes
		this.drawEdges(graph)

		// let other systems know our graph has been populated
		this.events.emit('graphReady', entity, graph)
	}

	getAdjacencyList = (graph: Graph): void => {
		// Walk through each node of the 'dungeon' and define connections between edges
		// Create an adjacency list (e.g. node 0 -> 1, 2)
		// Example: { 0 => [ 1 ], 1 => [ 2, 4 ], 2 => [ 3 ], 3 => [ 4 ] }
		// This data structure is easier to traverse than just a list of edges

		for (let i = 0; i < graph.edges.length; i++) {
			// todo - figure out why this is only firing 1x (instead of 5x)
			// Assign to local variables so it's easier to read
			const src = graph.edges[i].src_identifier
			const dst = graph.edges[i].dst_identifier

			// Check if node is already in adjacency list
			if (!graph.adjacency.get(src)) {
				graph.adjacency.set(src, [])
			}
			// Add destination to adjacency list
			graph.adjacency.get(src).push(dst)

			// Check if node is already in reverse adjacency list
			if (!graph.reverseAdjacency.get(dst)) {
				graph.reverseAdjacency.set(dst, [])
			}
			// Add destination to adjacency list
			graph.reverseAdjacency.get(dst).push(src)
		}
	}

	getDepths = (graph: Graph): void => {
		// Calculate depth for each individual node
		for (const [key, value] of graph.nodes) {
			const depth = this.calculateDepth(graph.nodes.get(key), graph)
			graph.depth.set(key, depth)
		}
	}

	getDepthList = (graph: Graph): void => {
		// Generate a depth list (chcek how many nodes have a given depth)
		for (const [key, value] of graph.depth) {
			// Make sure we have an array for this depth
			if (!graph.depthList.get(value)) {
				graph.depthList.set(value, [])
			}

			// Add this node to depth list
			graph.depthList.get(value).push(key)
		}
	}

	drawNodes = (graph: Graph): void => {
		// Start walking through each node
		for (const [key, value] of graph.nodes) {
			this.events.emit(
				'executeCreateNode',
				// 'enqueueCreateNode', // Toggle this to render nodes step by step
				graph.nodes.get(key).index,
				this.container
			)
		}
	}

	drawEdges = (graph: Graph): void => {
		// Loop through each edge (vertices)
		for (let i = 0; i < graph.edges.length; i++) {
			const src = graph.edges[i].src_identifier
			const dst = graph.edges[i].dst_identifier
			this.events.emit(
				'executeCreateEdge',
				// 'enqueueCreateEdge', // Toggle this to render edges step by step
				graph.nodes.get(src),
				graph.nodes.get(dst),
				this.container
			)
		}
	}

	// Utility functions
	breadthFirst = (graph: Graph) => {
		// Use BFS (depth-first) search
		const start = 0 // We always start at position zero

		// Walk through each node of the 'dungeon' and output the path
		const queue = [start]
		const visited = {}
		visited[start] = true

		let currentVertex

		// Iterate until there are no edges left to visit
		while (queue.length) {
			// Grab the first node
			currentVertex = queue.shift()
			const node = new Node(currentVertex)
			graph.nodes.set(currentVertex, node)

			// Make sure node has a next step
			if (graph.adjacency.get(currentVertex)) {
				graph.adjacency.get(currentVertex).forEach((neighbor) => {
					if (!visited[neighbor]) {
						visited[neighbor] = true
						queue.unshift(neighbor)
					}
				})
			}
		}
	}

	depthFirst = (graph: Graph) => {
		// Use DFS (depth-first) search so we can add a spacer after we hit a dead end
		const start = 0 // We always start at position zero

		// Walk through each node of the 'dungeon' and output the path
		const stack = [start]
		const visited = {}
		visited[start] = true

		let currentVertex

		// Iterate until there are no edges left to visit
		while (stack.length) {
			// Grab the first node
			currentVertex = stack.pop()
			const node = new Node(currentVertex)
			graph.nodes.set(currentVertex, node)

			// Make sure node has a next step
			if (graph.adjacency.get(currentVertex)) {
				graph.adjacency.get(currentVertex).forEach((neighbor) => {
					if (!visited[neighbor]) {
						visited[neighbor] = true
						stack.push(neighbor)
					}
				})
			}
		}
	}

	// Returns the depth of a given node (via BFS)
	calculateDepth = (node: Node, graph: Graph) => {
		const start = 0 // We always start at position zero
		let depth = 0 // Keep track of the depth we've traversed

		const visited = new Set()
		const queue = [start]
		// ACTION - Started search
		// We need to use cloneDeep because the array changes value during our delayed queue
		this.queueStep(node.index, _.cloneDeep(queue), depth, '  start')

		while (queue.length > 0) {
			this.queueStep(
				node.index,
				_.cloneDeep(queue),
				depth,
				`remove: ${queue[0]}`
			)

			const _node = queue.shift()

			if (_node === node.index) {
				// ACTION - Found depth
				this.queueStep(node.index, _.cloneDeep(queue), depth, `found: ${depth}`)
				return depth
			}

			const neighbors = graph.adjacency.get(_node)

			// We need to go one level deeper
			if (neighbors) {
				depth++
				for (let i = 0; i < neighbors.length; i++) {
					if (!visited.has(neighbors[i])) {
						// ACTION - AddNeighborToQueue
						// depth++
						visited.add(neighbors[i])
						this.queueStep(
							node.index,
							_.cloneDeep(queue),
							depth,
							`add: ${neighbors[i]}`
						)
						queue.unshift(neighbors[i])
					}
				}
			}
		}

		return depth
	}

	// Queues up an action
	queueStep = (
		index: number,
		queue: Array<number>,
		depth: number,
		step: string
	) => {
		const actionQueue = this.ecs.getComponentsByType(
			'actionQueue'
		)[0] as ActionQueue

		// Add our node to the queue
		actionQueue.actions.push(
			new DepthStepAction(this.events, index, queue, depth, step)
		)
	}
}
