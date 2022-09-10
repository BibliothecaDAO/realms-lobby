// render.ts - syncs transform component and sprite component (workaround because phaser has its own sprite)

import { Sprite } from '../components/sprite'
import { Transform } from '../components/transform'
import { GRID_SIZE } from '../config'
import { ISystem, Registry } from '../engine/registry'

export class RenderSystem implements ISystem {
    public events: Phaser.Events.EventEmitter
    private ecs: Registry

    constructor(events: Phaser.Events.EventEmitter, ecs: Registry) {
        this.ecs = ecs
    }

    update = () => {
        // Grab all sprites
        const entities = this.ecs.getEntitiesByComponentType('sprite')

        if (entities) {
            for (let i = 0; i < entities.length; i++) {
                // Grab transform for each sprite
                const sprite = this.ecs.getComponent(entities[i], 'sprite') as Sprite
                const transform = this.ecs.getComponent(entities[i], 'transform') as Transform

                // Make sure this entity should be displayed in the world (vs in a backpack)
                if (transform) {
                    // Update x/y when needed
                    if (transform.x * GRID_SIZE != sprite.sprite.x) {
                        sprite.sprite.setX(transform.x * GRID_SIZE)
                    }
                    if (transform.y * GRID_SIZE != sprite.sprite.y) {
                        sprite.sprite.setY(transform.y * GRID_SIZE)
                    }
                }
            }
        }
    }
}
