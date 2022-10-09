// createNodeAction.ts - Proxies event: 'createNode' to Create a node in a graph

import { IAction } from './IAction'

export class CreateNodeAction implements IAction {
	public type = 'createNode'

	private events: Phaser.Events.EventEmitter

	public index: number
	private container: Phaser.GameObjects.Container

	constructor(
		events: Phaser.Events.EventEmitter,
		index: number,
		container: Phaser.GameObjects.Container
	) {
		this.events = events

		this.index = index
		this.container = container
	}

	execute = () => {
		console.log('we executin')
		this.events.emit('executeCreateNode', this.index, this.container)
	}
}
