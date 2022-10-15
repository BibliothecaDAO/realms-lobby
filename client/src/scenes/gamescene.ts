// graphscene.ts - Displays a graph that adventurers can explore

import { Registry } from '../engine/registry'
import { World } from '../engine/world'

// Initialize sub-scenes
import { GameUIScene } from './uiscene'

// Initialize systems
import { SpawnSystem } from '../systems/spawnSystem'
import { PlayerSystem } from '../systems/playerSystem'
import { MoveSystem } from '../systems/moveSystem'

// Setup graph
import { GraphSystem } from '../systems/graphSystem/graphSystem'
import { RenderSystem } from '../systems/renderSystem'
import { RenderEdgeSystem } from '../systems/renderEdgeSystem'
import { CameraSystem } from '../systems/cameraSystem'

// Components

export class GameScene extends Phaser.Scene {
	public static Name = 'game-scene'

	// Event bus
	public events: Phaser.Events.EventEmitter

	// ECS system to initialize entities and systems
	public ecs: Registry

	// World to store our connection (so it persists between scenes)
	public world: World

	// Container where we'll draw our game objects
	public gameContainer: Phaser.GameObjects.Container

	public cursorFollow: Phaser.GameObjects.Text

	constructor() {
		super(GameScene.Name)
	}

	preload(): void {
		// Load necessary files for this map
	}

	create(data): void {
		// initialize engine
		this.ecs = data.ecs
		this.events = data.events
		this.world = data.world

		// Setup
		// Create area where we'll draw our graph
		// TODO - move this somewhere that makes more sense
		this.gameContainer = this.add.container(
			this.cameras.main.centerX,
			this.cameras.main.centerY
		)

		// Initialize subscenes
		this.scene.add(GameUIScene.Name, GameUIScene, false, {
			events: this.events,
			ecs: this.ecs,
		})

		// this.scene.add.

		// Initialize Game Rendering systems
		// Race conditions happen when we put these after the logic systems

		// Initialize Game Logic systems
		this.ecs.addSystem(new GraphSystem(this.events, this.ecs, this))
		this.ecs.addSystem(new SpawnSystem(this.events, this.ecs, this))
		this.ecs.addSystem(new PlayerSystem(this.events, this.ecs))
		this.ecs.addSystem(new MoveSystem(this.events, this.ecs))
		this.ecs.addSystem(new CameraSystem(this.events, this.ecs, this))
		this.ecs.addSystem(
			new RenderSystem(this.events, this.ecs, this, this.gameContainer)
		)
		this.ecs.addSystem(
			new RenderEdgeSystem(this.events, this.ecs, this, this.gameContainer)
		)

		// Running this up front because the camera can scroll before setPollAlways has been called (Resulting in improper values)
		this.input.setPollAlways() // The cursor should poll for new positions while the camera is moving

		// Monitor for events

		// Enable UI Scene
		this.scene.launch(GameUIScene.Name)

		// We've loaded all our systems and event handlers so request data from server
		this.events.emit('requestSnapshot')
	}

	update(): void {
		// Run through our systems and run each update function
		this.ecs.update()
	}
}
