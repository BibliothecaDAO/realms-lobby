// combatSystem.ts - When a character and an enemy occupy the same node... battle!

import EventEmitter from 'events'
import { ISystem, Registry } from '../engine/registry'

// Components
import { Transform } from '../components/transform'
import { Weapon } from '../components/weapon'
import { Health } from '../components/health'

export class CombatSystem implements ISystem {
	private events: EventEmitter
	private ecs: Registry

	// Player's entity
	private player: string

	constructor(events: EventEmitter, ecs: Registry) {
		this.events = events
		this.ecs = ecs

		// Listen for events
		this.events.on('setupPlayer', this.setupPlayer)
		this.events.on('spawnSuccess', this.setWeaponDelay)
	}

	update = () => {
		// Check for character and enemy at same location
		if (this.player != undefined) {
			// Get a list of all 'living' entity (which have health component) locations
			// We need to do this so we can avoid 'dead' entities (which have no 'health' component)
			const livingEntities = this.ecs.query('transform', 'health')

			// Get transforms for each of the entities with transform/health components
			const transforms = []
			for (const entity of livingEntities) {
				transforms.push(this.ecs.getComponent(entity, 'transform') as Transform)
			}

			// Get player's location
			const playerTransform = this.ecs.getComponent(
				this.player,
				'transform'
			) as Transform

			if (
				playerTransform != undefined &&
				transforms != undefined &&
				transforms.length > 0
			) {
				// Identify other transforms at the same location
				const transformsAtLocation = this.ecs.filter(
					transforms,
					'node',
					playerTransform.node
				)

				// More than one entity is on a node!
				if (transformsAtLocation.length > 1) {
					// Loop through and check if each entity should attack
					const firstEntity = transformsAtLocation[0]
					const firstEntityWeapon = this.ecs.getComponent(
						firstEntity,
						'weapon'
					) as Weapon
					const firstEntityHealth = this.ecs.getComponent(
						firstEntity,
						'health'
					) as Health

					const secondEntity = transformsAtLocation[1]
					const secondEntityWeapon = this.ecs.getComponent(
						secondEntity,
						'weapon'
					) as Weapon
					const secondEntityHealth = this.ecs.getComponent(
						secondEntity,
						'health'
					) as Health

					// First character attacks
					this.attackAttempt(
						firstEntity,
						firstEntityHealth,
						firstEntityWeapon,
						secondEntityHealth
					)

					// Second character atacks
					this.attackAttempt(
						secondEntity,
						secondEntityHealth,
						secondEntityWeapon,
						firstEntityHealth
					)
				}
			}
		}
	}

	// Event responders
	setupPlayer = (player: string) => {
		this.player = player
	}

	setWeaponDelay = (entity: string) => {
		const weapon = this.ecs.getComponent(entity, 'weapon') as Weapon
		if (weapon != undefined) {
			weapon.nextAttack = weapon.delay
		}
	}

	// Utility functions
	attackAttempt = (
		attacker: string,
		attackerHealth: Health,
		attackerWeapon: Weapon,
		targetHealth: Health
	) => {
		// make sure character is alive
		if (attackerHealth.amount > 0) {
			// make sure it's the character's turn to attack
			if (attackerWeapon.nextAttack == 0) {
				// Attack!
				console.log(`${attacker} attacks for ${attackerWeapon.damage} damage!`)
				targetHealth.amount -= attackerWeapon.damage
				console.log(`defender has ${targetHealth.amount} health left!`)

				// reset countdown for next attack
				attackerWeapon.nextAttack = attackerWeapon.delay
			} else {
				attackerWeapon.nextAttack--
			}
		}
	}
}
