// graphDebugUI - Handles drawing any debug UI (e.g. arrows to traverse) when debugging a graph

import Phaser from 'phaser'
import { ISystem, Registry } from '../../../../engine/registry'
import { DEBUGCOLORS } from '../../../../config'

// Components
import { ActionQueue } from '../../../../components/actionQueue'
import { IAction } from '../actions/IAction'

// Actions
import { CreateNodeAction } from '../actions/createNodeAction'

export class GraphDebugUI implements ISystem {
	private events: Phaser.Events.EventEmitter
	private ecs: Registry
	private scene: Phaser.Scene

	// Entity and reference to our action queue
	private actionQueue: ActionQueue

	private indexes: Array<number> = []
	// TODO - Migrate this to the actionQueue component

	// Button State
	private allowPrev = false
	private allowNext = false

	// Buttons and text objects
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
		this.events.on('setupActionQueue', this.setupActionQueue)
		this.events.on('spawnZone', this.setupGraph)
		this.events.on('clearCanvas', this.clearActions)
		this.events.on('tookAction', this.updateStep)

		// Set background color
		this.scene.cameras.main.setBackgroundColor(DEBUGCOLORS.bg.toString())
		// Draw 'panel' that sits behind buttons
		this.drawPanel()
		this.setupControls()
	}

	update() {
		// Make sure we've initialized the action queue
		// console.log(this.actionQueue)
		if (this.actionQueue) {
			// Check if we should de-activate buttons
			if (this.allowPrev && this.actionQueue.currentStep == 0) {
				this.deactivatePrevUI()
			}

			if (
				this.allowNext &&
				this.actionQueue.currentStep == this.actionQueue.actions.length - 1
			) {
				this.deactivateNextUI()
			}

			// Check if we should re-activate buttons
			if (
				!this.allowNext &&
				this.actionQueue.currentStep < this.actionQueue.actions.length - 1
			) {
				this.activateNextUI()
			}

			if (!this.allowPrev && this.actionQueue.currentStep > 0) {
				this.activatePrevUI()
			}

			// We've bumped a step
			if (
				this.currentStepText.text != this.actionQueue.currentStep.toString()
			) {
				this.currentStepText.setText(this.actionQueue.currentStep.toString())
			}
		}
	}

	// Event Listeners
	setupActionQueue = (entity: string) => {
		this.actionQueue = this.ecs.getComponent(
			entity,
			'actionQueue'
		) as ActionQueue
	}

	// Store the entity for our graph so we can pull it down when needed
	setupGraph = (entity: string) => {
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

	// Clear out the recent actions so we can redraw the screen
	clearActions = () => {
		this.indexes = []
	}

	updateStep = (action: IAction) => {
		// Only update text for nodes (not edges)
		if (action.type === 'createNode') {
			const node = action as CreateNodeAction
			this.indexes.push(node.index)
			this.graphText.setText(JSON.stringify(this.indexes))
		}
	}

	// Utility Functions
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
				this.actionQueue.currentStep++
				this.currentStepText.setText(this.actionQueue.currentStep.toString())
				this.events.emit('stepQueue', this.actionQueue.currentStep)
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
				this.actionQueue.currentStep--
				this.currentStepText.setText(this.actionQueue.currentStep.toString())
				this.events.emit('stepQueue', this.actionQueue.currentStep)
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
