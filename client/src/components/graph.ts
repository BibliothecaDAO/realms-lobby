// graph - Information necessary to draw and traverse a graph

import { IComponent } from '../engine/registry'
import { Edge } from '../systems/graphSystem/edge'

export class Graph implements IComponent {
    public type = 'graph'

    public edges: Edge[] = []
    public nodes: Array<number> = []
    public adjacency: Map<number, number[]> = new Map()
    public reverseAdjacency: Map<number, number[]> = new Map()


    constructor(edges?: Edge[]) {
        this.edges = edges
    }
}
