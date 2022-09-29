// graphSystem - Loads a graph, parses it, and traverses it
// Returns an object that can be sent to the client and displayed

import EventEmitter from 'events'
import { ISystem, Registry } from '../../engine/registry'

import { Edge } from './edge'

export class GraphSystem implements ISystem {
    private events: EventEmitter
    private ecs: Registry

    public type = 'graphSystem'
    public graph: Edge[] = []
    public adjacencyList: Map<number, number[]> = new Map()

    constructor(events: EventEmitter, ecs: Registry) {
        this.events = events
        this.ecs = ecs

         // Stub out initial graph
        const edges = [
            [0, 1, 1],
            [ 1, 2, 1 ],
            [ 2, 3, 1 ],
            [ 3, 4, 1 ],
            [1, 4, 1]
            // [4, 0, 1]    // Finish the graph (loop to exit)
        ]

        // Listen for events
        // this.events.on('spawnZone', this.setupGraph)

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
            this.graph.push(new Edge(edges[i][0], edges[i][1], edges[i][2]))
        }
        console.log(this.graph)

        // Parse edges
        this.createVertices()

        this.printGraph()
        // Map all of the nodes
        // this.traverseGraph()

        // Draw Graph
    }

    createVertices = (): void => {
        // Walk through each node of the 'dungeon' and define connections between edges
        // Create an adjacency list (e.g. node 0 -> 1, 2)
        // Example: { 0 => [ 1 ], 1 => [ 2, 4 ], 2 => [ 3 ], 3 => [ 4 ] }
        // This data structure is easier to traverse than just a list of edges

        for (let i = 0; i < this.graph.length; i++) {
            // Assign to local variables so it's easier to read
            const src = this.graph[i].src_identifier
            const dst = this.graph[i].dst_identifier
            if(!this.adjacencyList.get(src)) {
                this.adjacencyList.set(src, [])
            }
            
            // Add destination to adjacency list
            this.adjacencyList.get(src).push(dst)
        }

        console.log(this.adjacencyList)
    }

    traverseGraph = () => {
        const start = 0 // We always start at position zero

        let index = start // Keep numbers for each node so we can refer to them
        console.log(index)

        // Walk through each node of the 'dungeon' and output the path
        const result = []
        const stack = [start]
        const visited = {}
        visited[start] = true

        let currentVertex

        // Iterate until there are no edges left to visit
        while (stack.length) {
            // Grab the first node
            currentVertex = stack.pop() 
            result.push(currentVertex)

            // Make sure node has a next step
            if (this.adjacencyList.get(currentVertex)) {
                this.adjacencyList.get(currentVertex).forEach(neighbor => {
                    if (!visited[neighbor]) {
                        visited[neighbor] = true
                        stack.push(neighbor)

                        // We've hit a new node
                        index++
                        console.log(index)
                    }
                })
            }
        }   

        console.log(result)
        return(result)
    }

    printGraph = () => {
        const start = 0 // We always start at position zero

        // Walk through each node of the 'dungeon' and output the path
        const result = []
        const stack = [start]
        const visited = {}
        visited[start] = true

        let currentVertex

        // Iterate until there are no edges left to visit
        while (stack.length) {
            // Grab the first node
            currentVertex = stack.shift() 
            result.push(currentVertex)

            // Make sure node has a next step
            if (this.adjacencyList.get(currentVertex)) {
                this.adjacencyList.get(currentVertex).forEach(neighbor => {
                    if (!visited[neighbor]) {
                        visited[neighbor] = true
                        stack.push(neighbor)
                    }
                })
            }
        }   

        for (let i = 0; i < this.graph.length; i++) {
            console.log(`${this.graph[i].src_identifier} -> ${this.graph[i].dst_identifier}`)
        }

        console.log(result)
        return(result)
    }

    debug = () => {
        console.log(this.graph)
    }
}

