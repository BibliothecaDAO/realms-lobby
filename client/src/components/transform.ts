// transform - Which node am I occupying?
// e.g. node: 1 means the entity currently sits at that node number and can move from there to other nodes

import { IComponent } from '../engine/registry'

export class Transform implements IComponent {
	public type = 'transform'

	// Which graph node are we currently occupying
	public node: string

	constructor(node: string) {
		this.node = node
	}
}
