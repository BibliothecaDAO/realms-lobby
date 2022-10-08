// _templateCommand.ts - Template to make it easier to create new commands

import { ICommand } from './ICommand'

export class TemplateCommand implements ICommand {
	public type = 'template'

	// Define any properties here (e.g. node)

	constructor() {
		// Assign any properties here
	}

	execute = () => {
		// Define any actions here
	}
}
