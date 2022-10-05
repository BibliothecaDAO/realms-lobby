// moveSystem.ts - Move things (e.g. characters) around the map
// Authoritative moves come down from the server via events (handled by the 'connection' class)
// Client can send moveRequests to the server which will then send back a validMove event.

import { ISystem, Registry } from '../engine/registry'

// Components
import { Transform } from '../components/transform'
import { Zone } from '../components/zone'

export class MoveSystem implements ISystem {
    private events: Phaser.Events.EventEmitter
    private ecs: Registry

    constructor(events: Phaser.Events.EventEmitter, ecs: Registry) {
        this.events = events
        this.ecs = ecs

        // Listen for events
        // Move the character to anohter position on the map
        this.events.on('move', this.validMove)
    }

    update = () => {
        //
    }

    // Event responders
    // Receive a valid move from the server
    validMove = (entity, x, y) => {
        const transform = this.ecs.getComponent(entity, 'transform') as Transform

        const zone = this.ecs.getComponent(entity, 'zone') as Zone
        const graph = zone.graph

        // TODO - Implement move code (server -> client)
        // 1. Figure out current position
        // 2. breadth-first search to calcluate potential moves
        // 3. Calculate if this is a valid move (is it within breadth first bounds of 1 step?)
        // 4. Move to that node
        
        // transform.x = x
        // transform.y = y

        // const sprite = this.ecs.getComponent(entity, 'sprite') as Sprite
        // sprite.sprite.x = x
        // sprite.sprite.y = y
    }

    // Utility functions
}
