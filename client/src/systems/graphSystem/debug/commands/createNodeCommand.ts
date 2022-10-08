// createNodeCommand.ts - Proxies event: 'createNode' to Create a node in a graph

import { ICommand } from './ICommand'
import { Node } from '../../node'

export class CreateNodeCommand implements ICommand {
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
		this.events.emit('executeCreateNode', this.index, this.container)
	}
}
