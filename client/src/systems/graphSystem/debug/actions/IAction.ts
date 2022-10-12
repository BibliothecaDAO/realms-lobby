// IAction.ts - Abstract actions into an object using command pattern
// currently used to queue up actions in our graph debugger

export interface IAction {
	type: string

	execute: () => void
}
