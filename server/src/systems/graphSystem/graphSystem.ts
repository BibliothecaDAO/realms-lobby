// graphSystem - Loads a graph, parses it, and traverses it
// Returns an object that can be sent to the client and displayed

import EventEmitter from 'events'
import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../../engine/registry'

// Graph data structures
import { Edge } from './edge'

export class GraphSystem implements ISystem {
    private events: EventEmitter
    private ecs: Registry
    public type = 'graphSystem'

    // Graph data
    public edges: Edge[] = []
    public adjacency: Map<number, number[]> = new Map()
    public reverseAdjacency: Map<number, number[]> = new Map()
    public nodes: Array<number> = []
    
    // Graph state
    public currentNode: number = 0

    constructor(events: EventEmitter, ecs: Registry) {
        this.events = events
        this.ecs = ecs

        // Event Handlers
        this.events.on('loadGraph', this.setupGraph)
    }


    update = () => {
    }

    // Instantiates edges and prepares to traverse them
    setupGraph = (edges): void => {
        for (let i = 0; i < edges.length; i++) {
            // Add edge to graph
            this.edges.push(new Edge(edges[i][0], edges[i][1], edges[i][2]))
        }

        // Create adjacency list that we can traverse
        this.createVertices()

        // Identify nodes via breath first search
        this.breadthFirst()
        
    }

    createVertices = (): void => {
        // Walk through each node of the 'dungeon' and define connections between edges
        // Create an adjacency list (e.g. node 0 -> 1, 2)
        // Example: { 0 => [ 1 ], 1 => [ 2, 4 ], 2 => [ 3 ], 3 => [ 4 ] }
        // This data structure is easier to traverse than just a list of edges

        for (let i = 0; i < this.edges.length; i++) {
            // Assign to local variables so it's easier to read
            const src = this.edges[i].src_identifier
            const dst = this.edges[i].dst_identifier

            // Check if node is already in adjacency list
            if(!this.adjacency.get(src)) {
                this.adjacency.set(src, [])
            }
            // Add destination to adjacency list
            this.adjacency.get(src).push(dst)

            if (!this.reverseAdjacency.get(dst)) {
                this.reverseAdjacency.set(dst, [])
            }
            // Add source to reverse adjacency list
            this.reverseAdjacency.get(dst).push(src)
        }
    }

    // Utility functions
    // Returns the depth of a given node (via BFS)
    getDepth = (node) => {
        const start = 0 // We always start at position zero
        let count = 0   // Keep track of the depth we've traversed

        const visited = new Set()
        const queue = [start]

        while (queue.length > 0) {
            const _node = queue.pop()
            if (_node === node) {
                break;
            }

            const neighbors = this.adjacency.get(_node)
            if (neighbors) {
                for (let i = 0; i < neighbors.length; i++) {
                    if (!visited.has(neighbors[i])) {
                        // We found a new node, add it to the queue
                        count++
                        visited.add(neighbors[i])
                        queue.push(neighbors[i])
                    }   
                }
            } else { 
                // We didn't encounter a subgraph so we should backtrack
                count--
            }
        }
         
        return(count)
    }

    breadthFirst = () => {
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
            this.nodes.push(currentVertex)

            // Make sure node has a next step
            if (this.adjacency.get(currentVertex)) {
                this.adjacency.get(currentVertex).forEach(neighbor => {
                    if (!visited[neighbor]) {
                        visited[neighbor] = true
                        queue.push(neighbor)
                    }
                })
            }
        } 
    }

     depthFirst = () => {
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
            this.nodes.push(currentVertex)

            // Make sure node has a next step
            if (this.adjacency.get(currentVertex)) {
                this.adjacency.get(currentVertex).forEach(neighbor => {
                    if (!visited[neighbor]) {
                        visited[neighbor] = true
                        stack.push(neighbor)
                    }
                })
            }
        } 
    }

    debug = () => {
        console.log(this.edges)
    }
}

