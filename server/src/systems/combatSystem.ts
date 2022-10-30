// combatSystem.ts - When a character and an enemy occupy the same node... battle!

import EventEmitter from 'events'
import { ISystem, Registry } from '../engine/registry'

// Components
import { Transform } from '../components/transform'

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
	}

	update = () => {
		// Check for character and enemy at same location
		if (this.player != undefined) {
			// Get player's location
			const transform = this.ecs.getComponent(
				this.player,
				'transform'
			) as Transform

			// Get all the transforms
			const transforms = this.ecs.getComponentsByType('transform')

			// Identify other transforms at the same location
			const transformsAtLocation = this.ecs.filter(
				transforms,
				'node',
				transform.node
			)
			console.log(transformsAtLocation)
		}
		// const entities = this.ecs.query('transform', 'node')
		// Means they ready to rumble.
		// TODO: Make them battle          lkl
	}

	// Event responders
	setupPlayer = (player: string) => {
		this.player = player
	}

	// Utility functions
}
