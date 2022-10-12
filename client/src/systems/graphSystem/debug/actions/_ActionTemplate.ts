// _templateAction.ts - Template to make it easier to create new actions

import { IAction } from './IAction'

export class TemplateAction implements IAction {
	public type = 'template'

	// Define any properties here (e.g. node)

	constructor() {
		// Assign any properties here
	}

	execute = () => {
		// Define any actions here
	}
}
