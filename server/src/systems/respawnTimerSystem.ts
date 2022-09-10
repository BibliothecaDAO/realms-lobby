// respawnTimer System - Counts down until an entity needs to respawn (e.g. when a tree is chopped down)

import { ISystem } from '../engine/registry'
import EventEmitter from 'events'
import { Registry } from '../engine/registry'

import { Respawn } from '../components/respawn'
import { RespawnTimer } from '../components/respawnTimer'

export class RespawnTimerSystem implements ISystem {
    private events: EventEmitter
    private ecs: Registry

    constructor(events: EventEmitter, ecs: Registry) {
        this.events = events
        this.ecs = ecs

        // Event Handlers
        this.events.on('startRespawnTimer', this.startRespawnTimer)
    }

    update = () => {
        const respawnTimers = this.ecs.getComponentsByType('respawnTimer')

        if (respawnTimers.length > 0) {
            for (let i = 0; i < respawnTimers.length; i++) {
                // Decreemnt timer until it hits zero then trigger respawn
                if (respawnTimers[i].timer > 0) {
                    respawnTimers[i].timer--
                } else {
                    // Figure out which entity this is attached to
                    const entity = this.ecs.getEntityByComponent(respawnTimers[i])

                    if (entity) {
                        // Make sure we don't continue counting down
                        this.ecs.removeComponent(entity, respawnTimers[i])
                        this.events.emit('respawnAttempt', entity)
                    } else {
                        throw new Error('Could not remove respawn timer')
                    }
                }
            }
        }
    }

    // adds a respawn timer to this entity which will count down til it respawns
    startRespawnTimer = (entity: string) => {
        const respawn = this.ecs.getComponent(entity, 'respawn') as Respawn

        // Start our countdown timer until respawn
        if (respawn) {
            const respawnTimer = new RespawnTimer(respawn.spawnTime)
            this.ecs.addComponent(entity, respawnTimer)
        } else {
            throw new Error(`Cannot add a respawn timer to an entity with no 'respawn' component`)
        }
    }

    // Utility Functions
}
