// graphSystem - Loads a graph, parses it, and traverses it
// Returns an object that can be sent to the client and displayed

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../../engine/registry'

// Components
import { Zone } from '../../components/zone'
import { Graph } from '../../components/graph'

// Graph data structures
import { Edge } from './edge'
import { Node } from './node'

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
	}

	update = () => {
		//
	}

	// Instantiates edges and prepares to traverse them
	setupGraph = (entity: string, component: Zone): void => {
		const edges: Edge[] = []

		// Sort graph by src (first) then destination
		// component.graph.sort((a, b) => {
		// 	return a[0] - b[0] || a[1] - b[1]
		// })

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

		// Create adjacency list that we can traverse
		this.createVertices(graph)

		// Identify nodes via breath first search
		this.breadthFirst(graph)

		// create a container which will adjust the position of all child gameobjects inside it
		this.container = this.scene.add.container(
			this.scene.cameras.main.centerX,
			this.scene.cameras.main.centerY
		)

		this.calculateNodes(graph)
		this.calculateVertices(graph)
	}

	createVertices = (graph: Graph): void => {
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

			if (!graph.reverseAdjacency.get(dst)) {
				graph.reverseAdjacency.set(dst, [])
			}

			// Add source to reverse adjacency list
			graph.reverseAdjacency.get(dst).push(src)
		}
	}

	calculateNodes = (graph: Graph): void => {
		// Start walking through each node
		for (let i = 0; i < graph.nodes.size; i++) {
			this.events.emit('createNode', graph.nodes.get(i).index, this.container)

			// // let the rendering system know to draw this node
			// this.events.emit(
			// 	'createNode',
			// 	index,
			// 	graph.nodes.get(i).x,
			// 	graph.nodes.get(i).y,
			// 	this.container
			// )
		}
	}

	calculateVertices = (graph: Graph): void => {
		// Loop through each edge (vertices)
		for (let i = 0; i < graph.edges.length; i++) {
			const src = graph.edges[i].src_identifier
			const dst = graph.edges[i].dst_identifier

			this.events.emit(
				'createEdge',
				graph.nodes.get(src),
				graph.nodes.get(dst),
				this.container
			)
			// this.events.emit('testevent', src, dst, this.container)
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
						queue.push(neighbor)
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

	debug = (graph: Graph) => {
		console.log(graph.edges)
	}
}
