// weapon - Allows an entity to attack/do damage to another entity

import { IComponent } from '../engine/registry'

export class Health implements IComponent {
	public type = 'health'

	public amount: number

	constructor(amount: number) {
		this.amount = amount
	}
}
