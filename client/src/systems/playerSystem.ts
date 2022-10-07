// playerSystem.ts - Identifies our player

import Phaser from 'phaser'
import { ISystem, Registry } from '../engine/registry'

// Components
import { Player } from '../components/player'

export class PlayerSystem implements ISystem {
	private events: Phaser.Events.EventEmitter
	private ecs: Registry

	constructor(events: Phaser.Events.EventEmitter, ecs: Registry) {
		this.events = events
		this.ecs = ecs

		// Listen for events
		this.events.on('setupPlayer', this.setupPlayer)
	}

	update = () => {
		//
	}

	// Event responders
	setupPlayer = (entity: string) => {
		// Attach 'Player' component so we know which entity is our player
		const player = new Player()
		this.ecs.addComponent(entity, player)
	}

	// Utility functions
}
