// Open a door
// This is how a player knows what's going to happen at this node

import { IAction } from '../../../engine/actionQueue'
import { Registry } from '../../../engine/registry'
import { Sprite } from '../../../components/sprite'

export class OpenDoorAnimation implements IAction {
	started = false
	finished = false

	doorSprite: Sprite // The door housing the enemy
	entity: string // The entity that contains the door and enemy
	enemySprite: Sprite // The enemy sprite
	ecs: Registry

	constructor(doorSprite: Sprite, entity: string, ecs: Registry) {
		this.doorSprite = doorSprite
		this.entity = entity
		this.ecs = ecs
	}

	update = () => {
		// Kick off the animation
		// Only play the animation once
		if (!this.started) {
			this.started = true
			this.animate(this.doorSprite, this.entity, this.ecs)
		}
	}

	private animate = (doorSprite: Sprite, entity: string, ecs: Registry) => {
		// Open the door
		// Spawn a new door
		const openDoor = doorSprite.sprite.scene.add
			.sprite(doorSprite.sprite.x, doorSprite.sprite.y, 'door-open')
			.setScale(4)

		// Destroy existing door
		this.ecs.removeComponent(entity, doorSprite)
		doorSprite.sprite.destroy()

		// Fade door out
		openDoor.scene.tweens.add({
			delay: 1800,
			targets: openDoor,
			alpha: {
				from: 1,
				to: 0,
			},
			ease: 'Power1',
			duration: 700,
			repeat: 0,
			onStart: () => {
				this.finished = true
			},
			onComplete: () => {
				openDoor.destroy()
			},
		})
	}

	shakeCamera = (sprite: Sprite) => {
		const camera = sprite.sprite.scene.cameras.main

		// Slight camera zoom in/out
		sprite.sprite.scene.tweens.add({
			delay: 300,
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

	revealEnemy = (enemySprite: Sprite) => {
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
