// moves - A valid list of moves for each node

import { IComponent } from '../engine/registry'

export class moves implements IComponent {
	public type = 'moves'

	public list: Map<number, number[]> = new Map()

	constructor(list: Map<number, number[]>) {
		this.list = list
	}
}
