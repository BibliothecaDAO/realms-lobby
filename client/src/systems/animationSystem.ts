// Animations -

import { ISystem, Registry } from '../engine/registry'

// Components
import { Sprite } from '../components/sprite'
import { getLocation } from './utils/getLocation'
import { Graph } from '../components/graph'
import { Transform } from '../components/transform'

// TODO - Adapt this for a movement animatino system
// When player moves:

export class AnimationSystem implements ISystem {
	private ecs: Registry
	private events: Phaser.Events.EventEmitter

	private graph: Graph

	constructor(events: Phaser.Events.EventEmitter, ecs: Registry) {
		this.ecs = ecs
		this.events = events

		// Event Listeners
		this.events.on('spawnZone', this.setupGraph)
		this.events.on('moveAttempt', this.handleMove)
	}

	// Event listeners
	setupGraph = (entity: string) => {
		try {
			this.graph = this.ecs.getComponent(entity, 'graph') as Graph
		} catch (e) {
			console.error(e)
		}
	}

	// Player moves to a new node
	handleMove = (entity: string, src: number, dst: number): void => {
		try {
			const sprite = (this.ecs.getComponent(entity, 'sprite') as Sprite).sprite

			// Kick off (slow) move tween
			if (sprite != undefined && src != undefined && dst != undefined) {
				// Determine which direction to move
				const startLocation = getLocation(src, this.graph)
				const endLocation = getLocation(dst, this.graph)

				// Player moves from source to destination
				sprite.scene.tweens.add({
					delay: 0,
					targets: sprite,
					x: {
						from: startLocation.x,
						to: endLocation.x,
					},
					y: {
						from: startLocation.y,
						to: endLocation.y,
					},
					ease: 'Power1',
					duration: 1000,
					repeat: 0,
				})
			}
			// Kick off (fast, looping) walk tween
			// When player reaches destination
			// Stop both tweens (can we ease into it?)
		} catch (e) {
			console.error(e)
		}
	}

	update = () => {
		//
	}

	// Helper funftions
}
