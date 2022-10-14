// actionQueue - Keep track of actions that have been performed (e.g. so we can play them back)

import { IComponent } from '../engine/registry'

import { IAction } from '../systems/actionQueueSystem'

export class ActionQueue implements IComponent {
	public type = 'actionQueue'

	public actions: Array<IAction>
	public currentStep = 0

	// By default action queue will be empty
	constructor(actions: Array<IAction> = []) {
		this.actions = actions
	}
}
