// graphDebugSystem.ts - Every graph calcuation goes into a queue that can be played back
// Should help us debug the graph and eventually be re-used for player actions (e.g. instant replay)

import Phaser from 'phaser'
import { ISystem, Registry } from '../../../engine/registry'
import { IAction } from './actions/IAction'

import { DEBUGCOLORS } from '../../../config'

// Components
import { Node } from '../node'
import { ActionQueue } from '../../../components/actionQueue'

// Define Actions
import { CreateNodeAction } from './actions/createNodeAction'
import { CreateEdgeAction } from './actions/createEdgeAction'

export class GraphDebugSystem implements ISystem {
	private events: Phaser.Events.EventEmitter
	private ecs: Registry
	private scene: Phaser.Scene

	private graphEntity: string

	private actionQueueEntity: string
	private actionQueue: ActionQueue

	private lastQueue: Array<IAction> = []

	private currentStep = 0
	private maxSteps

	// UI State
	private allowPrev = false
	private allowNext = false

	// UI Elements
	private leftArrow: Phaser.GameObjects.Text
	private currentStepText: Phaser.GameObjects.Text
	private rightArrow: Phaser.GameObjects.Text

	private graphText: Phaser.GameObjects.Text

	constructor(
		events: Phaser.Events.EventEmitter,
		ecs: Registry,
		scene: Phaser.Scene
	) {
		this.events = events
		this.ecs = ecs
		this.scene = scene

		// Listen for events
		this.events.on('spawnZone', this.setupGraph)
		// this.events.on('createNode', this.enqueueCreateNode)
		// this.events.on('createEdge', this.enqueueCreateEdge)

		this.scene.cameras.main.setBackgroundColor(DEBUGCOLORS.bg.toString())

		// Setup action queue
		this.createActionQueue()
		this.drawPanel()
		this.setupControls()
	}

	update = () => {
		// Step through the queue whenver there are actions
		// Primarily used at the start before the graph is loaded into our actionQueue to avoid race conditions
		if (this.lastQueue != this.actionQueue.actions) {
			if (this.actionQueue.actions.length > 0 && this.currentStep >= 0) {
				this.stepThroughQueue()
				// Store the action queue so we don't call this over and over again
				this.lastQueue = this.actionQueue.actions
			}
		}

		// Check if we should de-activate buttons
		if (this.allowPrev && this.currentStep == 0) {
			this.deactivatePrevUI()
		}

		if (
			this.allowNext &&
			this.currentStep == this.actionQueue.actions.length - 1
		) {
			this.deactivateNextUI()
		}

		// Check if we should re-activate buttons
		if (
			!this.allowNext &&
			this.currentStep < this.actionQueue.actions.length - 1
		) {
			this.activateNextUI()
		}

		if (!this.allowPrev && this.currentStep > 0) {
			this.activatePrevUI()
		}
	}

	// Event responders
	// Create action queue so we can pull it down when needed
	createActionQueue = () => {
		this.actionQueue = new ActionQueue()
		this.actionQueueEntity = this.ecs.createEntity()
		this.ecs.addComponent(this.actionQueueEntity, this.actionQueue)
	}

	// Store the entity for our graph so we can pull it down when needed
	setupGraph = (entity: string) => {
		this.graphEntity = entity

		// Place graph text on the screen
		this.graphText = this.scene.add.text(
			this.scene.cameras.main.width * 0.4,
			this.scene.cameras.main.height / 9,
			'[]',
			{
				fontSize: '100px',
				color: DEBUGCOLORS.primary.toString(),
			}
		)
	}

	// UI
	setupControls = () => {
		this.scene.add.text(230, 70, 'step', {
			fontSize: '30px',
			color: DEBUGCOLORS.bg.toString(),
		})

		this.leftArrow = this.scene.add.text(100, 100, '↢', {
			fontSize: '100px',
			color: DEBUGCOLORS.inactive.toString(),
		})

		this.currentStepText = this.scene.add.text(230, 100, '0', {
			fontSize: '100px',
			color: DEBUGCOLORS.bg.toString(),
		})

		this.rightArrow = this.scene.add.text(350, 100, '↣', {
			fontSize: '100px',
			color: DEBUGCOLORS.inactive.toString(),
		})
	}
	// Utility functions
	// Process any items in the queue sequentially
	stepThroughQueue = () => {
		// Clear the queue and re-draw from scratch
		const indexes = []

		// Destroy all our game objects and redraw them (vs an undo step)
		this.events.emit('clearCanvas')

		// Update current step text
		this.currentStepText.setText(this.currentStep.toString())

		// Process items in the queue
		for (let i = 0; i <= this.currentStep; i++) {
			this.actionQueue.actions[i].execute()

			// TODO - Test edge rendering

			// Only update text for nodes (not edges)
			if (this.actionQueue.actions[i].type === 'createNode') {
				const node = this.actionQueue.actions[i] as CreateNodeAction
				indexes.push(node.index)
				this.graphText.setText(JSON.stringify(indexes))
			}
		}
	}

	drawPanel = () => {
		const panel = this.scene.add.rectangle(
			this.scene.cameras.main.width / 6, // anchor to left side of screen
			this.scene.cameras.main.height / 2, // full height
			this.scene.cameras.main.width / 3, // 1/3 of screen
			this.scene.cameras.main.height, // full height
			DEBUGCOLORS.primary.hex
		)
	}

	activateNextUI = () => {
		this.allowNext = true

		this.rightArrow
			.setFill(DEBUGCOLORS.secondary.toString())
			.setInteractive()
			.on('pointerover', () => {
				this.rightArrow.setAlpha(0.8)
				this.scene.input.setDefaultCursor('pointer')
			})
			.on('pointerout', () => {
				this.rightArrow.setAlpha(1)
				this.scene.input.setDefaultCursor('default')
			})
			.on('pointerup', () => {
				this.currentStep++
				this.stepThroughQueue()
			})
	}

	activatePrevUI = () => {
		this.allowPrev = true

		this.leftArrow
			.setFill(DEBUGCOLORS.secondary.toString())
			.setInteractive()
			.removeAllListeners()
			.on('pointerover', () => {
				this.leftArrow.setAlpha(0.8)
				this.scene.input.setDefaultCursor('pointer')
			})
			.on('pointerout', () => {
				this.leftArrow.setAlpha(1)
				this.scene.input.setDefaultCursor('default')
			})
			.on('pointerup', () => {
				this.currentStep--
				this.stepThroughQueue()
			})
	}

	deactivateNextUI = () => {
		this.allowNext = false
		this.rightArrow
			.removeAllListeners()
			.disableInteractive()
			.setFill(DEBUGCOLORS.inactive.toString())
	}

	deactivatePrevUI = () => {
		this.allowPrev = false
		this.leftArrow.disableInteractive().setFill(DEBUGCOLORS.inactive.toString())
	}
}
