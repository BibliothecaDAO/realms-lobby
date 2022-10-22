// Move to a spot right before the target node
// This is where we'll start combat or item reveal from

import { GameObjects } from 'phaser'
import { IAction } from '../../../engine/actionQueue'

export class MoveAnimation implements IAction {
	started = false
	finished = false

	sprite: GameObjects.Sprite // The character that is moving
	start: Phaser.Math.Vector2 // The x/y position of the node to start moving from
	dst: Phaser.Math.Vector2 // The x/y position of the node to move to

	constructor(
		sprite: GameObjects.Sprite,
		start: Phaser.Math.Vector2,
		dst: Phaser.Math.Vector2
	) {
		this.sprite = sprite
		this.start = start
		this.dst = dst
	}

	update = () => {
		// Kick off the animation
		// Only play the animation once
		if (!this.started) {
			this.started = true
			this.animate(this.sprite, this.start, this.dst)
		}
	}

	private animate = (sprite, start, dst) => {
		// Keep track of our tween so we can destroy it upon completion
		let shuffleTween

		// Kick off (fast, single shot) walk tween to destination
		sprite.scene.tweens.add({
			delay: 0,
			targets: sprite,
			x: {
				from: start.x,
				to: dst.x,
			},
			y: {
				from: start.y,
				to: dst.y,
			},
			ease: 'Power1',
			duration: 2000,
			repeat: 0,
			onStart: () => {
				// Kick off (short,looping) shuffle tween to destination
				shuffleTween = sprite.scene.tweens.add({
					delay: 0,
					targets: sprite,
					rotation: 0.2,
					ease: 'Power1',
					duration: 100,
					repeat: -1,
					yoyo: true,
				})
			},
			onComplete: () => {
				shuffleTween.destroy()
				// If we don't make it back to our idle rotation, quickly snap to it
				if (sprite.rotation != 0) {
					sprite.scene.tweens.add({
						delay: 0,
						targets: sprite,
						rotation: 0,
						ease: 'Power1',
						duration: 100,
						repeat: 0,
						onComplete: () => {
							this.finished = true
						},
					})
				} else {
					// Sprite is already rotated properly
					this.finished = true
				}
			},
		})
	}
}
