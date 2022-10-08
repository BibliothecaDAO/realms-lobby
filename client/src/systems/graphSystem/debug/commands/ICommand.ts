// command.ts - Abstract actions into an object
// currently used to queue up actions in our graph debugger

export interface ICommand {
	type: string

	execute: () => void
}
