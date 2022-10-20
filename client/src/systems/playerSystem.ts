// playerSystem.ts - Identifies our player

import Phaser from 'phaser'
import { ISystem, Registry } from '../engine/registry'

// Components
import { Player } from '../components/player'
import { Sprite } from '../components/sprite'

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
		try {
			// Attach 'Player' component so we know which entity is our player
			const player = new Player()
			this.ecs.addComponent(entity, player)

			// Set player sprite to white
			const sprite = this.ecs.getComponent(entity, 'sprite') as Sprite

			if (sprite != undefined) {
				sprite.sprite.setAlpha(1)
				sprite.sprite.setTintFill(0xffffff)
			}
		} catch (e) {
			console.error(e)
		}
	}

	// Utility functions
}
