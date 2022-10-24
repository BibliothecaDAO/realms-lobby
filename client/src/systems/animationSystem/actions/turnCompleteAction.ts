// HACK - Let other classes know our turn is complete (e.g. so edges highlight)

import { GameObjects } from 'phaser'
import { IAction } from '../../../engine/actionQueue'

// Components
import { Transform } from '../../../components/transform'

export class TurnCompleteAction implements IAction {
	started = false
	finished = false

	entity: string
	transform: Transform
	events: Phaser.Events.EventEmitter

	constructor(
		entity: string,
		transform: Transform,
		events: Phaser.Events.EventEmitter
	) {
		this.entity = entity
		this.transform = transform
		this.events = events
	}

	update = () => {
		// Kick off the animation
		// Only play the animation once
		if (!this.started) {
			this.started = true
			this.animate(this.entity, this.transform)
		}
	}

	private animate = (entity: string, transform: Transform) => {
		this.events.emit('selectNode', entity, null, transform.node + 1)
		this.finished = true
	}
}
