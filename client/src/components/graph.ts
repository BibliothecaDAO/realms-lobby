// graph - Information necessary to draw and traverse a graph

import { IComponent } from '../engine/registry'
import { Edge } from '../systems/graphSystem/edge'

export class Graph implements IComponent {
	public type = 'graph'

	public edges: Edge[] = []
	// Reference to other entities (strings)
	public nodes: Map<number, string> = new Map()
	public adjacency: Map<number, number[]> = new Map()
	public reverseAdjacency: Map<number, number[]> = new Map()
	public depth: Map<number, number> = new Map()
	public depthList: Map<number, number[]> = new Map()

	constructor(edges?: Edge[]) {
		this.edges = edges
	}
}
