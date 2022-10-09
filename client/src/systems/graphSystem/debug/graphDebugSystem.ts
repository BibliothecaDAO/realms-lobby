// graphDebugSystem.ts - Every graph calcuation goes into a queue that can be played back
// Should help us debug the graph and eventually be re-used for player actions (e.g. instant replay)

import Phaser from 'phaser'
import { ISystem, Registry } from '../../../engine/registry'
import { IAction } from './actions/IAction'

import { DEBUGCOLORS } from '../../../config'

// Components
import { ActionQueue } from '../../../components/actionQueue'

// Define Actions
import { CreateNodeAction } from './actions/createNodeAction'

export class GraphDebugSystem implements ISystem {
	private events: Phaser.Events.EventEmitter
	private ecs: Registry

	private graphEntity: string

	private actionQueueEntity: string
	private actionQueue: ActionQueue

	private lastQueue: Array<IAction> = []

	constructor(events: Phaser.Events.EventEmitter, ecs: Registry) {
		this.events = events
		this.ecs = ecs

		// Listen for events
		this.events.on('spawnZone', this.setupGraph)
		this.events.on('stepQueue', this.stepThroughQueue)

		// Setup action queue
		// this.createActionQueue()
	}

	update = () => {
		// Step through the queue whenver there are actions
		// Primarily used at the start before the graph is loaded into our actionQueue to avoid race conditions
		if (this.actionQueue) {
			if (this.lastQueue != this.actionQueue.actions) {
				if (
					this.actionQueue.actions.length > 0 &&
					this.actionQueue.currentStep >= 0
				) {
					this.stepThroughQueue(this.actionQueue.currentStep)
					// Store the action queue so we don't call this over and over again
					this.lastQueue = this.actionQueue.actions
				}
			}
		}
	}

	// Event responders
	setupGraph = (graphEntity: string) => {
		// Wait to create this, otherwise we have race conditions and other classes get undefineds
		this.createActionQueue()
	}

	// Create action queue so we can pull it down when needed
	createActionQueue = () => {
		this.actionQueue = new ActionQueue()
		this.actionQueueEntity = this.ecs.createEntity()
		this.ecs.addComponent(this.actionQueueEntity, this.actionQueue)

		this.events.emit('setupActionQueue', this.actionQueueEntity)
	}

	// UI

	// Utility functions
	// Process any items in the queue sequentially
	stepThroughQueue = (index: number) => {
		// Clear the queue and re-draw from scratch

		// Destroy all our game objects and redraw them (vs an undo step)
		this.events.emit('clearCanvas')

		// Process items in the queue
		for (let i = 0; i <= index; i++) {
			this.actionQueue.actions[i].execute()
			this.events.emit('tookAction', this.actionQueue.actions[i])

			// TODO - Test edge rendering
		}
	}
}
