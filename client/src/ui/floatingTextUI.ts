// floatingText - Pops up a little floating text whenever an event happens

import { Registry } from '../engine/registry'

// Components
import { Sprite } from '../components/sprite'

export type transfer = {
	type: string
	sender: string
	recipient: string
}

export class FloatingTextUI {
	private ecs: Registry
	private events: Phaser.Events.EventEmitter
	private scene: Phaser.Scene

	constructor(
		ecs: Registry,
		events: Phaser.Events.EventEmitter,
		scene: Phaser.Scene
	) {
		this.ecs = ecs
		this.events = events
		this.scene = scene

		// Listen to events that trigger floating text
		this.events.on('damage', this.handleDamage)
	}

	// Event listeners
	handleDamage = (target: string, damage: number): void => {
		// Show floating text when enemy gets hit
		if (target && damage) {
			const targetSprite = this.ecs.getComponent(target, 'sprite') as Sprite

			// TODO - Account for world x/y
			const x = targetSprite.sprite.x - 30
			const y = targetSprite.sprite.y - 30
			const floatDestination = y - 50

			const floater = targetSprite.sprite.scene.add.text(x, y, `-${damage}`, {
				color: '#ff0000',
				fontSize: '2em',
			})
			// this.spawnQueue.set(target, { type: 'text', sender: attacker, recipient: target, amount: damage })

			this.displayFloater(targetSprite, floatDestination, floater)
		}
	}

	displayFloater = (
		targetSprite: Sprite,
		floatDestination: number,
		floater
	) => {
		targetSprite.sprite.scene.tweens.add({
			targets: floater,
			y: floatDestination,
			ease: 'Quad.easeOut',
			delay: 100,
			duration: 1000,
			// TODO - figure out why our alpha isn't going to zero
			// Fade out the text object on completion
			onStart: () => {
				console.log('got here')
				targetSprite.sprite.scene.tweens.add({
					delay: 300,
					targets: floater,
					alpha: 0,
					ease: 'Quad.easeOut',
					duration: 650,
					// Destroy our object on completion
					onComplete: () => {
						floater.destroy()
					},
				})
			},
		})
	}
}
