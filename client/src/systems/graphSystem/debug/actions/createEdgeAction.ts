// createNodeAction.ts - Proxies event: 'createNode' to Create a node in a graph

import { IAction } from './IAction'
import { Node } from '../../node'

export class CreateEdgeAction implements IAction {
	public type = 'createEdge'
	private events: Phaser.Events.EventEmitter

	public src: Node
	public dst: Node

	private container: Phaser.GameObjects.Container

	constructor(
		events: Phaser.Events.EventEmitter,
		src: Node,
		dst: Node,
		container: Phaser.GameObjects.Container
	) {
		this.events = events

		this.src = src
		this.dst = dst

		this.container = container
	}

	execute = () => {
		this.events.emit('executeCreateEdge', this.src, this.dst, this.container)
	}
}
