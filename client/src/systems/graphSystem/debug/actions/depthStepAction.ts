// DepthStepAction.ts - Snapshot of our getDepth algo

import { IAction } from './IAction'

export class DepthStepAction implements IAction {
	public type = 'depthStep'

	private events: Phaser.Events.EventEmitter

	public index: number
	public queue: Array<number>
	public depth: number
	public step: string

	constructor(
		events: Phaser.Events.EventEmitter,
		index: number,
		queue: Array<number>,
		depth: number,
		step: string
	) {
		this.events = events
		this.index = index
		this.queue = queue
		this.depth = depth
		this.step = step
	}

	execute = () => {
		this.events.emit('selectNode', null, this.index)
		this.events.emit('showDepth', this.index, this.queue, this.depth, this.step)
	}
}
