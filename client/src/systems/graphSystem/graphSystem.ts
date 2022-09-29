// graphSystem - Loads a graph, parses it, and traverses it
// Returns an object that can be sent to the client and displayed

import EventEmitter from 'events'
import { ISystem, Registry } from '../../engine/registry'

import { Edge } from './edge'

export class GraphSystem implements ISystem {
    private events: Phaser.Events.EventEmitter
    private ecs: Registry
    private scene: Phaser.Scene

    public type = 'graphSystem'
    public edges: Edge[] = []
    public adjacency: Map<number, number[]> = new Map()
    public reverseAdjacency: Map<number, number[]> = new Map()
    public nodes: Array<number> = []
    
    public nodeTexts: Array<Phaser.GameObjects.Text> = []

    constructor(events: Phaser.Events.EventEmitter, ecs: Registry, scene: Phaser.Scene) {
        this.events = events
        this.ecs = ecs
        this.scene = scene

         // Stub out initial graph
        const edges = [
            [0, 1, 1],
            [ 1, 2, 1 ],
            [ 2, 3, 1 ],
            [ 3, 4, 1 ],
            [1, 4, 1]
            // [4, 0, 1]    // Finish the graph (loop to exit)
        ]

        // HACK - parse graph data
        this.setupGraph(edges)
       
    }


    update = () => {
    //
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

        this.drawNodes()
        this.drawVertices()

        

        // Map all of the nodes
        // this.traverseGraph()

        // Draw Graph
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

    drawNodes = () => {
        // How far from the edge of the canvas should we draw each node?
        const xOffset = 100
        const yOffset = 100
        
        // How much space should we add between two nodes?
        const xSpacer = 100
        const ySpacer = 100

        // Start walking through each node
        for (let i = 0; i < this.nodes.length; i++) {
            const x = xOffset * (this.getDepth(this.nodes[i])+1)
            
            let numEdges = this.reverseAdjacency.get(this.nodes[i]) ? this.reverseAdjacency.get(this.nodes[i]).length : 1
            let y = yOffset * numEdges
            
            let index = this.nodes[i].toString()
            // this.nodeTexts.push(this.scene.add.text(x, y, this.nodes[i].toString(), { color: 'white' }).setDepth(2))
            this.nodeTexts[index] = this.scene.add.text(x, y, this.nodes[i].toString(), { color: 'white' })
                .setDepth(2)
                .setOrigin(0.5)
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

    drawVertices = () => {
        const graphics = this.scene.add.graphics();

        for (let i = 0; i < this.edges.length; i++) {
            // console.log(`${this.edges[i].src_identifier} -> ${this.edges[i].dst_identifier}`)
            const src = this.edges[i].src_identifier
            const dst = this.edges[i].dst_identifier

            const srcNode = this.nodeTexts[src]
            const dstNode = this.nodeTexts[dst]

            graphics.lineStyle(2, 0xFFFFFF)
            graphics.lineBetween(srcNode.x, srcNode.y, dstNode.x, dstNode.y)
        }

        for (let i = 0; i < this.nodeTexts.length; i++) {
            this.scene.add.circle(this.nodeTexts[i].x, this.nodeTexts[i].y, 30, 0xFF6B00).setDepth(1)
            console.log(`${i}: (${this.nodeTexts[i].x}, ${this.nodeTexts[i].y}`)
        }
    }

    debug = () => {
        console.log(this.edges)
    }
}

