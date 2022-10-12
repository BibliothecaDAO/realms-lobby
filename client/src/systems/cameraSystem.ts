// cameraSystem.ts - Camera should follow the player as they move around

import Phaser, { Cameras, GameObjects } from 'phaser'
import { ISystem, Registry } from '../engine/registry'
import { GRID_SIZE } from '../config'

// Components
import { Zone } from '../components/zone'
import { Transform } from '../components/transform'
import { Graph } from '../components/graph'

export class CameraSystem implements ISystem {
	private events: Phaser.Events.EventEmitter
	private ecs: Registry
	private scene: Phaser.Scene

	// Components that tell us where the player is moving
	private transform: Transform
	private graph: Graph
	private camera: Cameras.Scene2D.Camera

	// The currently selected node
	private currentNode: number

	// Smooth camera scroll
	private drag: number
	private nextPos: number

	constructor(
		events: Phaser.Events.EventEmitter,
		ecs: Registry,
		scene: Phaser.Scene
	) {
		this.events = events
		this.ecs = ecs
		this.scene = scene

		// Listen for events
		this.events.on('graphReady', this.setupGraph)
		this.events.on('setupPlayer', this.setupPlayer)

		this.camera = this.scene.cameras.main

		this.setupClickToDrag()
	}

	update = () => {
		// Snap camera to player's position (current node)
		// Only activate if we have our player's transform and graph setup
		if (this.transform != undefined && this.graph != undefined) {
			// Fire once (When our player moves to a new node)
			if (this.currentNode != this.transform.node) {
				// HACK - hardcoded from graphSystem.ts
				const xOffset = this.scene.cameras.main.centerX
				const yOffset = this.scene.cameras.main.centerY

				this.currentNode = this.transform.node
				const x = xOffset + this.graph.nodes.get(this.currentNode).x
				const y = yOffset + this.graph.nodes.get(this.currentNode).y

				this.camera.centerOn(x, y)
			}
		}
	}

	// Event responders
	setupClickToDrag = () => {
		// Set the cursor to 'grab' so user knows they can grab thet screen
		this.scene.input.setDefaultCursor('grab')

		// When mouse is pressed down and moving, move the camera left/right
		this.scene.input.on('pointermove', (p) => {
			if (!p.isDown) return

			// Pan camera left/right if we drag the mouse (but not up/down)
			this.camera.scrollX -= (p.x - p.prevPosition.x) / this.camera.zoom
			this.scene.input.setDefaultCursor('grabbing')
		})

		// When cursor is released, reset the cursor to 'grab'
		this.scene.input.on('pointerup', (p) => {
			this.scene.input.setDefaultCursor('grab')
		})
	}
	// Set the bounds of the world so we know when to start panning
	setMapBounds = (entity, zone: Zone) => {
		// HACK - Zoom the screen and pan to player
		// If we call zoom in the game constructor, followPlayer breaks.
		this.scene.cameras.main.zoomTo(4, 100)

		// HACK - we don't have an x, y for the zone yet
		/*
		// Set bounds of world to the same size as our tilemap.
		// This allows us to call world coordinates (e.g. via mouse pointer)
		this.scene.physics.world.setBounds(
			0,
			0,
			zone.width * GRID_SIZE,
			zone.height * GRID_SIZE
		)

		// Setup camera to follow player around
		this.scene.cameras.main.setBounds(
			0,
			0,
			zone.width * GRID_SIZE,
			zone.height * GRID_SIZE
		) */
	}

	// Load the graph so we can get node x/y coordinates
	setupGraph = (entity: string, graph: Graph) => {
		this.graph = graph
	}

	setupPlayer = (entity: string) => {
		// Grab the transform (which has current node)
		this.transform = this.ecs.getComponent(entity, 'transform') as Transform
	}

	// Utility functions
}
