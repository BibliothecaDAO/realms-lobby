// Combat Animation - Player attacks an enemy

import { IAction } from '../../../engine/actionQueue'
import { Registry } from '../../../engine/registry'

import { GameObjects } from 'phaser'

// Components
import { Sprite } from '../../../components/sprite'

export class CombatAnimation implements IAction {
	started = false
	finished = false

	attacker: string // The entity that is attacking
	attackerComponent: Sprite
	defender: string // The entity that is being attacked
	defenderComponent: Sprite

	constructor(
		attacker: string,
		attackerComponent: Sprite,
		defender: string,
		defenderComponent: Sprite
	) {
		this.attacker = attacker
		this.attackerComponent = attackerComponent
		this.defender = defender
		this.defenderComponent = defenderComponent

		this.registerAnimation()
	}

	update = () => {
		// Kick off the animation
		// Only play the animation once
		if (!this.started) {
			this.started = true
			this.animate(
				this.attacker,
				this.attackerComponent,
				this.defender,
				this.defenderComponent
			)
		}
	}

	private animate = (
		attacker: string,
		attackerComponent: Sprite,
		defender: string,
		defenderComponent: Sprite
	) => {
		// Player attacks an enemy
		this.attack(attackerComponent, defenderComponent)
		// Enemy attacks the player
		// Player attacks the enemy
		// Enemy dies
	}

	attack = (attackerComponent: Sprite, defenderComponent: Sprite) => {
		const attackerSprite = attackerComponent.sprite
		attackerSprite.play('attack')
		attackerSprite.chain('idle')
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

	// Spritesheet Animations
	registerAnimation = () => {
		const scene = this.attackerComponent.sprite.scene
		// Import asesprite animations (stored in json file)
		// Export instructions: https://newdocs.phaser.io/docs/3.54.0/focus/Phaser.Loader.LoaderPlugin-aseprite
		scene.anims.createFromAseprite('warrior')
	}
}
