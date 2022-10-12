// zone - A dungeon a player can explore
// Each dungeon is procedurally generated via a seed and outputs a graph

import { IComponent } from '../engine/registry'

export class Zone implements IComponent {
	public type = 'zone'

	// Used to generate the graph
	public seed: number
	public length: number

	// Graph data (computed by server currently, eventually by client)
	public graph

	constructor(seed: number, length: number) {
		this.seed = seed
		this.length = length
	}
}
