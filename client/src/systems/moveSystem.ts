// moveSystem.ts - Move things (e.g. characters) around the map
// Authoritative moves come down from the server via events (handled by the 'connection' class)
// Client can send moveRequests to the server which will then send back a validMove event.

import { Sprite } from '../components/sprite'
import { Transform } from '../components/transform'
import { ISystem, Registry } from '../engine/registry'

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
        transform.x = x
        transform.y = y

        const sprite = this.ecs.getComponent(entity, 'sprite') as Sprite
        sprite.sprite.x = x
        sprite.sprite.y = y
    }

    // Utility functions
}
