import { World } from './engine/world'
import { Connections } from './engine/connections'
import EventEmitter from 'events'
import { Registry } from './engine/registry'

import { LoadData } from './engine/loadData'
import { js as Finder } from 'easystarjs' // https://github.com/prettymuchbryce/easystarjs

// Systems
import { DestinationSystem } from './systems/destinationSystem'
import { MapSystem } from './systems/mapSystem'
import { MoveSystem } from './systems/moveSystem'
import { SpawnSystem } from './systems/spawnSystem'
import { RespawnTimerSystem } from './systems/respawnTimerSystem'
import { InventorySystem } from './systems/inventorySystem'

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

        // HACK - initialize pathfinding library so we can share it between map/move systems
        const finder = new Finder()

        // Setup systems
        this.ecs.addSystem(new MapSystem(this.events, this.ecs, finder))
        this.ecs.addSystem(new MoveSystem(this.events, this.ecs, finder))
        this.ecs.addSystem(new SpawnSystem(this.events, this.ecs))
        this.ecs.addSystem(new RespawnTimerSystem(this.events, this.ecs))
        this.ecs.addSystem(new DestinationSystem(this.events, this.ecs))
        this.ecs.addSystem(new InventorySystem(this.events, this.ecs))

        // Start accepting connections from player
        this.connections = new Connections(this.events, this.world)
    }
}

new Server()
