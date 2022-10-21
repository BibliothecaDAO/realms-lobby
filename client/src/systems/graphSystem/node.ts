// node.ts - Defines a node (point) in the graph
// A node is connected by edges and can be clicked on to move to the next node

export class Node {
	index: number
	depth: number

	constructor(index: number) {
		this.index = index
	}
}
