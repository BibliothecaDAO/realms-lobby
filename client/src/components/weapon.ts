// weapon - Allows an entity to attack/do damage to another entity

import { IComponent } from '../engine/registry'

export class Weapon implements IComponent {
	public type = 'weapon'

	public damage: number // How many hp to subtract from an entity when we attack?
	public delay: number // How many turns (in frames) should we wait between attacks?
	public nextAttack: number // How many turns (in frames) are remaining until next attack?

	constructor(damage: number, delay: number) {
		this.damage = damage
		this.delay = delay
	}
}
