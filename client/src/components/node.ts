// node - A node in the graph which represents the position relative to other nodes

import { IComponent } from '../engine/registry'

export class Node implements IComponent {
	public type = 'node'

	// The index within the graph (used in adjacencylists, etc)
	public index: number
	// How deep in the graph are we?
	public depth: number
	// adjacency list - what nodes can we traverse to from here?
	public adjacent: Array<string> = []

	// Position on screen to draw anything at this node
	public x: number
	public y: number

	constructor(index: number) {
		this.index = index
	}
}
