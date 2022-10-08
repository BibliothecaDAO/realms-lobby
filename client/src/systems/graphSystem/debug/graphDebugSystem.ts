// template.ts - Copy/paste this to create a new system

import Phaser from 'phaser'
import { ISystem, Registry } from '../../../engine/registry'
import { ICommand } from './commands/ICommand'

import { DEBUGCOLORS } from '../../../config'

// Components
import { Graph } from '../../../components/graph'
import { Node } from '../node'

// Define Commands
import { CreateNodeCommand } from './commands/createNodeCommand'
import { CreateEdgeCommand } from './commands/createEdgeCommand'

export class GraphDebugSystem implements ISystem {
	private events: Phaser.Events.EventEmitter
	private ecs: Registry
	private scene: Phaser.Scene

	private graphEntity: string

	private actionQueue: Array<ICommand> = []
	private lastQueue: Array<ICommand> = []

	private currentStep = 0
	private maxSteps

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
		this.events.on('createNode', this.enqueueCreateNode)
		this.events.on('createEdge', this.enqueueCreateEdge)

		this.scene.cameras.main.setBackgroundColor(DEBUGCOLORS.bg.toString())

		this.drawPanel()
		this.setupControls()
		this.activateNextUI()
		this.activatePrevUI()
	}

	update = () => {
		// Step through the queue whenver there are actions
		// Primarily used at the start before the graph is loaded into our actionQueue to avoid race conditions
		if (this.lastQueue != this.actionQueue) {
			if (this.actionQueue.length > 0 && this.currentStep >= 0) {
				this.stepThroughQueue()
				// Store the action queue so we don't call this over and over again
				this.lastQueue = this.actionQueue
			}
		}
	}

	// Event responders
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

	enqueueCreateNode = (
		index: number,
		container: Phaser.GameObjects.Container
	) => {
		// Add our node to the queue
		this.actionQueue.push(new CreateNodeCommand(this.events, index, container))
	}

	enqueueCreateEdge = (
		src: Node,
		dst: Node,
		container: Phaser.GameObjects.Container
	) => {
		// Add our node to the queue
		this.actionQueue.push(
			new CreateEdgeCommand(this.events, src, dst, container)
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
			color: DEBUGCOLORS.secondary.toString(),
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
			this.actionQueue[i].execute()

			// TODO - Test edge rendering

			// Only update text for nodes (not edges)
			if (this.actionQueue[i].type === 'createNode') {
				const node = this.actionQueue[i] as CreateNodeCommand
				indexes.push(node.index)
				this.graphText.setText(JSON.stringify(indexes))
			}
		}
		// } else {
		// this.deactivateUI()
		// }
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
		this.rightArrow
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
		this.leftArrow
			.setInteractive()
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

	deactivateUI = () => {
		this.rightArrow
			.disableInteractive()
			.setFill(DEBUGCOLORS.inactive.toString())
	}
}