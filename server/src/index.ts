import { World } from './engine/world'
import { Connections } from './engine/connections'
import EventEmitter from 'events'
import { Registry } from './engine/registry'

import { LoadData } from './engine/loadData'

// Systems
import { MoveSystem } from './systems/moveSystem'
import { SpawnSystem } from './systems/spawnSystem'
import { GraphSystem } from './systems/graphSystem/graphSystem'

export default class Server {
	private world: World
	private connections: Connections
	private events: EventEmitter
	private ecs: Registry

	constructor() {
		// Create event bus to pass messages between systems
		this.events = new EventEmitter()

		// Setup ECS registry so we can use components and systems
		this.ecs = new Registry()

		const loadData = new LoadData(this.events)

		// Setup world and initial entities
		this.world = new World(this.ecs, this.events, loadData)

		// Setup systems
		this.ecs.addSystem(new MoveSystem(this.events, this.ecs))
		this.ecs.addSystem(new SpawnSystem(this.events, this.ecs))
		this.ecs.addSystem(new GraphSystem(this.events, this.ecs))

		// Start accepting connections from player
		// TODO - Consider splitting this out into its own server (proxy connections between client/game server)
		this.connections = new Connections(this.events)
	}
}

new Server()
