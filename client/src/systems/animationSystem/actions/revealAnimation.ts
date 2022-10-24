// Reveal an enemy at a node

import { IAction } from '../../../engine/actionQueue'
import { Registry } from '../../../engine/registry'

import { GameObjects } from 'phaser'

// Components
import { Sprite } from '../../../components/sprite'

export class RevealAnimation implements IAction {
	started = false
	finished = false

	entity: string // The entity that contains the door and enemy
	enemySprite: Sprite // The enemy sprite
	ecs: Registry

	constructor(entity: string, enemySprite: Sprite, ecs: Registry) {
		this.entity = entity
		this.enemySprite = enemySprite
		this.ecs = ecs
	}

	update = () => {
		// Kick off the animation
		// Only play the animation once
		if (!this.started) {
			this.started = true
			this.animate(this.entity, this.enemySprite)
		}
	}

	private animate = (entity: string, enemySprite: Sprite) => {
		const sprite = enemySprite.sprite
		// Shake the screen a bit on enemy reveal
		this.shakeCamera(sprite)

		// Reveal the enemy
		this.ecs.addComponent(entity, enemySprite)
		this.revealEnemy(sprite)
	}

	shakeCamera = (sprite: GameObjects.Sprite) => {
		const camera = sprite.scene.cameras.main

		// Slight camera zoom in/out
		sprite.scene.tweens.add({
			delay: 400,
			targets: camera,
			zoom: 1.05,
			ease: 'Sine.easeInOut',
			duration: 120,
			repeat: 2,
			yoyo: true,
			onStart: () => {
				// Add slight screen shake
				camera.shake(100, 0.005)
			},
		})
	}

	revealEnemy = (sprite: GameObjects.Sprite) => {
		// Fade in enemy
		sprite.scene.tweens.add({
			delay: 0,
			targets: sprite,
			alpha: {
				from: 0,
				to: 1,
			},
			ease: 'Power1',
			duration: 500,
			repeat: 0,
			onComplete: () => {
				this.finished = true
			},
		})
	}
}
