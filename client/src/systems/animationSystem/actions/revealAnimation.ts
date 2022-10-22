// Open a door and reveal it
// This is how a player knows what's going to happen at this node

import { IAction } from '../../../engine/actionQueue'
import { Registry } from '../../../engine/registry'
import { GameObjects } from 'phaser'
import { Sprite } from '../../../components/sprite'

export class RevealAnimation implements IAction {
	started = false
	finished = false

	doorSprite: Sprite // The door housing the enemy
	entity: string // The entity that contains the door and enemy
	enemySprite: Sprite // The enemy sprite
	ecs: Registry

	constructor(
		doorSprite: Sprite,
		entity: string,
		enemySprite: Sprite,
		ecs: Registry
	) {
		this.doorSprite = doorSprite
		this.entity = entity
		this.enemySprite = enemySprite
		this.ecs = ecs
	}

	update = () => {
		// Kick off the animation
		// Only play the animation once
		if (!this.started) {
			this.started = true
			this.animate(this.doorSprite, this.entity, this.enemySprite, this.ecs)
		}
	}

	private animate = (
		doorSprite: Sprite,
		entity: string,
		enemySprite: Sprite,
		ecs: Registry
	) => {
		// Open the door
		// Spawn a new door
		const openDoor = doorSprite.sprite.scene.add
			.sprite(doorSprite.sprite.x, doorSprite.sprite.y, 'door-open')
			.setScale(4)
		// Destroy existing door
		console.log(this.ecs.getComponentsByEntity(entity))
		this.ecs.removeComponent(entity, doorSprite)
		doorSprite.sprite.destroy()

		// Fade door out
		openDoor.scene.tweens.add({
			delay: 0,
			targets: openDoor,
			alpha: {
				from: 1,
				to: 0,
			},
			ease: 'Power1',
			duration: 500,
			repeat: 0,
		})

		// Reveal the enemy
		const camera = enemySprite.sprite.scene.cameras.main
		// Slight screen shake
		camera.shake(100, 0.005)
		// Slight camera zoom in/out
		enemySprite.sprite.scene.tweens.add({
			delay: 0,
			targets: camera,
			zoom: 1.05,
			ease: 'Sine.easeInOut',
			duration: 120,
			// blur: 5000,
			repeat: 2,
			yoyo: true,
		})

		this.ecs.addComponent(entity, enemySprite)
		enemySprite.sprite.scene.tweens.add({
			delay: 0,
			targets: enemySprite.sprite,
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
