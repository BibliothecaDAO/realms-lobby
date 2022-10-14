// cameraSystem.ts - Camera should follow the player as they move around

import Phaser, { Cameras } from 'phaser'
import { ISystem, Registry } from '../engine/registry'

import { getLocation } from './utils/getLocation'

// Components
import { Zone } from '../components/zone'
import { Transform } from '../components/transform'
import { Node } from '../components/node'
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
	private currentNode: string

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

		this.setupClickToDrag()
	}

	update = () => {
		// Snap camera to player's position (current node)
		// Only activate if we have our player's transform and graph setup
		// When player moves, zoom to their new node
		// if (this.transform != undefined && this.graph != undefined) {
		// 	// Fire once (When our player moves to a new node)
		// 	if (this.currentNode != this.transform.node) {
		// 		// HACK - hardcoded from graphSystem.ts
		// 		const xOffset = this.scene.cameras.main.centerX
		// 		const yOffset = this.scene.cameras.main.centerY
		// 		this.currentNode = this.transform.node
		// 		const node = this.ecs.getComponent(this.currentNode, 'node') as Node
		// 		const x = xOffset + node.x
		// 		const y = yOffset + node.y
		// 		// this.camera.centerOn(x, y)
		// 	}
		// }
	}

	// Event responders
	setupClickToDrag = () => {
		// Set the cursor to 'grab' so user knows they can grab thet screen
		this.scene.input.setDefaultCursor('grab')

		// When mouse is pressed down and moving, move the camera left/right
		this.scene.input.on('pointermove', (p) => {
			if (!p.isDown) return

			// Pan camera left/right if we drag the mouse (but not up/down)
			this.scene.cameras.main.scrollX -=
				(p.x - p.prevPosition.x) / this.scene.cameras.main.zoom
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
		// this.scene.cameras.main.zoomTo(4, 100)
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
		// Start camera are player's current location
		const transform = this.ecs.getComponent(entity, 'transform') as Transform

		// Get the player's current location
		if (transform.node != undefined) {
			const node = this.ecs.getComponent(transform.node, 'node') as Node

			// Find the x/y coordinates of that node
			if (node != undefined) {
				const location = getLocation(node, this.graph)
				this.scene.cameras.main.centerOn(location.x, location.y)
			} else {
				throw new Error(
					`Node ${transform.node} cannot be found after ecs lookup`
				)
			}
		} else {
			throw new Error(`Player ${entity} has no node associated in Transform`)
		}
	}

	// Utility functions
}
