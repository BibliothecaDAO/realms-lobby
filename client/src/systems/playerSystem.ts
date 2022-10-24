// playerSystem.ts - Identifies our player

import Phaser, { GameObjects } from 'phaser'
import { ISystem, Registry } from '../engine/registry'

// Components
import { Player } from '../components/player'
import { Sprite } from '../components/sprite'

export class PlayerSystem implements ISystem {
	private events: Phaser.Events.EventEmitter
	private ecs: Registry

	private sprite: GameObjects.Sprite

	constructor(events: Phaser.Events.EventEmitter, ecs: Registry) {
		this.events = events
		this.ecs = ecs

		// Listen for events
		this.events.on('setupPlayer', this.setupPlayer)
	}

	update = () => {
		// HACK - make sure player is always at 100% alpha
		if (this.sprite && this.sprite.alpha != 1) {
			this.sprite.alpha = 1
		}
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

			// HACK force player alpha to 1 if it changes
			this.sprite = sprite.sprite
		} catch (e) {
			console.error(e)
		}
	}

	// Utility functions
}
