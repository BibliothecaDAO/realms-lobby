// ActionQueue.ts - A queue that handles actions we want to string together in sequence (e.g. move here then attack then get an item)
// Required for showing different animations when one completes, for example

// IAction - Abstracts actions into an object using command pattern
// currently used to queue up animations upon receiving server events

export interface IAction {
	// Has the action completed (and thus should be removed from the list)
	finished: boolean

	// Run this action's game loop
	update: () => void
}

export class ActionQueue {
	private queue: Array<IAction> = []

	constructor() {
		//
	}

	// Process the first action in the queue
	update = () => {
		try {
			// Step through the queue whenver there are actions
			if (this.queue != undefined && this.queue.length > 0) {
				this.queue[0].update()

				// if our action is finished, remove it from the queue
				if (this.queue[0].finished) {
					this.queue.shift()
				}
			}
		} catch (e) {
			console.error(e)
		}
	}

	// Add an action to the queue
	add = (action: IAction) => {
		this.queue.push(action)
	}
}
