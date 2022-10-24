// graphscene.ts - Displays a graph that adventurers can explore

// Initialize our engine
import { Registry } from '../engine/registry'
import { ActionQueue } from '../engine/actionQueue'

// Initialize sub-scenes
import { GameUIScene } from './uiscene'

// Initialize systems
import { SpawnSystem } from '../systems/spawnSystem'
import { PlayerSystem } from '../systems/playerSystem'
import { MoveSystem } from '../systems/moveSystem'
import { AnimationSystem } from '../systems/animationSystem/animationSystem'
import { CameraSystem } from '../systems/cameraSystem'

// Setup graph
import { GraphSystem } from '../systems/graphSystem/graphSystem'
import { RenderSystem } from '../systems/renderSystem'
import { RenderEdgeSystem } from '../systems/renderEdgeSystem'

// Components

export class GameScene extends Phaser.Scene {
	public static Name = 'game-scene'

	// Event bus
	public events: Phaser.Events.EventEmitter

	// ECS system to initialize entities and systems
	public ecs: Registry

	// Action Queue that handles actions we want to string together in sequence (e.g. move here then attack then get an item)
	private actions: ActionQueue

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
		this.actions = data.actions

		// Setup
		// Create area where we'll draw our graph

		// Initialize subscenes
		this.scene.add(GameUIScene.Name, GameUIScene, false, {
			events: this.events,
			ecs: this.ecs,
		})

		// Initialize Game Logic systems
		this.ecs.addSystem(new GraphSystem(this.events, this.ecs))
		this.ecs.addSystem(new SpawnSystem(this.events, this.ecs, this))
		this.ecs.addSystem(new PlayerSystem(this.events, this.ecs))
		this.ecs.addSystem(new MoveSystem(this.events, this.ecs, this))
		this.ecs.addSystem(new CameraSystem(this.events, this.ecs, this))

		// Initialize rendering systems
		this.ecs.addSystem(new RenderSystem(this.events, this.ecs, this))
		this.ecs.addSystem(new RenderEdgeSystem(this.events, this.ecs, this))

		// Animation Systems
		this.ecs.addSystem(
			new AnimationSystem(this.events, this.ecs, this, this.actions)
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
		this.actions.update()
	}
}
