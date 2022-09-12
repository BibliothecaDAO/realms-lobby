// SpawnSystem - Listens for spawn commands from server (e.g. when zone loads monster respawns, player connects) and creates a new entity accordingly

import { ISystem } from '../engine/registry'
import EventEmitter from 'events'
import { Registry } from '../engine/registry'

// Hardcode components for our lookup table
import { Collider } from '../components/collider'
import { Destination } from '../components/destination'
import { Inventory } from '../components/inventory'
import { Zone } from '../components/zone'
import { Player } from '../components/player'
import { Sprite } from '../components/sprite'
import { Transform } from '../components/transform'
import { Velocity } from '../components/velocity'

export class SpawnSystem implements ISystem {
    private events: EventEmitter
    private ecs: Registry
    private scene: Phaser.Scene

    constructor(events: EventEmitter, ecs: Registry, scene: Phaser.Scene) {
        this.events = events
        this.ecs = ecs
        this.scene = scene

        this.events.on('spawn', this.handleSpawn)
        this.events.on('despawn', this.handleDespawn)
    }

    update = () => {
        //
    }

    // Event Handlers
    handleSpawn = (entity: string, components) => {
        // If no entity is passed in (null), ecs registry will generate a new one
        entity = this.ecs.createEntity(entity)

        for (const index of Object.keys(components) as any) {
            let component
            // Determine which type of component to create
            // Hacky lookup table for our components
            switch (index) {
                case 'collider':
                    component = new Collider()
                    break
                case 'destination':
                    component = new Destination(components[index].x, components[index].y)
                    break
                case 'inventory':
                    component = new Inventory(components[index].items)
                    break
                case 'zone':
                    component = new Zone(components[index].width, components[index].height, components[index].tiles)
                    break
                case 'player':
                    component = new Player()
                    break
                case 'sprite':
                    const sprite = this.scene.add.sprite(-100, -100, components[index].name)
                    component = new Sprite(components[index].name, sprite)
                    break
                case 'transform':
                    component = new Transform(components[index].x, components[index].y)
                    break
                case 'velocity':
                    component = new Velocity(components[index].speed, components[index].dirX, components[index].dirY)
                    break
                default:
                    throw new Error(`component '${index}' not found`)
            }
            this.ecs.addComponent(entity, component)

            // HACK - special case zone spawn so the client can load pathfinding and tilemaps
            // Otherwise the zone component has to query every time anything spawns
            if (component.type == 'zone') {
                this.events.emit('spawnZone', entity, component)
            }
        }
        // Let other systems know we've intiialized a new entity
        this.events.emit('spawnSuccess', entity)
    }

    handleDespawn = (entity: string) => {
        // HACK - We need to manually remove the component's sprite otherwise phaser will keep rendering it
        const sprite = this.ecs.getComponent(entity, 'sprite') as Sprite
        if (sprite) {
            sprite.sprite.destroy()
        }
        this.ecs.destroyEntity(entity)
    }

    // Utility Functions
}
