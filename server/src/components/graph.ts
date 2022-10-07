// graph - Information necessary to draw and traverse a graph

import { IComponent } from '../engine/registry'
import { Edge } from '../systems/graphSystem/edge'
import { Node } from '../systems/graphSystem/node'

export class Graph implements IComponent {
	public type = 'graph'
	public hidden = true // Hide this component so the client can assemble its own graph (which it will have to do from starknet)

	public edges: Edge[] = []
	public nodes: Map<number, Node> = new Map()
	public adjacency: Map<number, number[]> = new Map()
	public reverseAdjacency: Map<number, number[]> = new Map()

	constructor(edges?: Edge[]) {
		this.edges = edges
	}
}
