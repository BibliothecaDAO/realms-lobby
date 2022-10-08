// actionQueue - Keep track of actions that have been performed (e.g. so we can play them back)

import { IComponent } from '../engine/registry'

import { ICommand } from '../systems/graphSystem/debug/commands/ICommand'

export class ActionQueue implements IComponent {
	public type = 'template'

	public actions: Array<ICommand>

	// By default action queue will be empty
	constructor(actions: Array<ICommand> = []) {
		this.actions = actions
	}
}
