// actionQueue - Keep track of actions that have been performed (e.g. so we can play them back)

import { IComponent } from '../engine/registry'

import { IAction } from '../systems/graphSystem/debug/actions/IAction'

export class ActionQueue implements IComponent {
	public type = 'actionQueue'

	public actions: Array<IAction>

	// By default action queue will be empty
	constructor(actions: Array<IAction> = []) {
		this.actions = actions
	}
}
