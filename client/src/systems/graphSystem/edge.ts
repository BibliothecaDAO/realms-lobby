// edge.ts - Defines an edge in the graph
// An edge can contain a source (how do I get here) and a destination (where can I go from here). 
// Once connecetd, edges form a graphand can be traversed

export class Edge {
	src_identifier: number
	dst_identifier: number
	weight: number
    
	constructor(src: number, dst: number, weight: number) {
		this.src_identifier = src
		this.dst_identifier = dst
		this.weight = weight
	}
}