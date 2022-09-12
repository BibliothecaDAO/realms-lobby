// followMouseSystem.ts - Place a sprite that follows the mouse

import { GameObjects } from 'phaser'
import { State, StateMachine } from '../engine/statemachine'

import { DEPTH } from '../config'
import { GRID_SIZE } from '../config'
import { ISystem, Registry } from '../engine/registry'
import { Sprite } from '../components/sprite'
import { Transform } from '../components/transform'
import { Enabled } from '../components/enabled'

export class FollowMouseSystem implements ISystem {
    events: Phaser.Events.EventEmitter
    ecs: Registry
    scene: Phaser.Scene

    entity: string

    private status: StateMachine

    private States = Object.freeze({
        // States should be immutable
        Enabled: Symbol('enabled'), // Actively following cursor (and visible)
        Disabled: Symbol('disabled') // Not actively following cursor
    })

    constructor(events: Phaser.Events.EventEmitter, ecs: Registry, scene: Phaser.Scene) {
        this.events = events
        this.ecs = ecs
        this.scene = scene

        // Spawn a new entity for our sprite following the cursor
        this.entity = this.ecs.createEntity()

        // Add a transform so we can update the location of our 'cursor'
        const transform = new Transform(
            Phaser.Math.Snap.To(this.scene.game.input.mousePointer.worldX - 5, GRID_SIZE) / GRID_SIZE,
            // Phaser.Math.Snap.To(this.scene.game.input.mousePointer.y + 40, GRID_SIZE) / GRID_SIZE
            Phaser.Math.Snap.To(this.scene.game.input.mousePointer.worldY + 40, GRID_SIZE) / GRID_SIZE
        )
        this.ecs.addComponent(this.entity, transform)

        // TODO - should state be stored in system or component?
        // We want to toggle on/off this component.
        const enabled = new Enabled(false) // Cursor is hidden by default
        this.ecs.addComponent(this.entity, enabled)

        // TODO - reconcile state machine state w/ enabled component
        // Configure tree state machine to keep track of its choppability
        this.status = new StateMachine(this.States.Disabled, [
            new State(this.States.Enabled, this.startFollow, null, this.stopFollow),
            new State(this.States.Disabled, null, null, null)
        ])

        // Setup events
        // HACK - Add our player to the game for firing events
        this.events.on('setupPlayer', (playerId) => {
            this.createCursor(playerId)
        })
        this.events.on('startmoving', () => {
            // We should start following the cursor
            const enabled = this.ecs.getComponent(this.entity, 'enabled') as Enabled
            enabled.active = true

            this.status.transition(this.States.Enabled)
        })

        this.events.on('stopmoving', () => {
            // We should start following the cursor
            this.status.transition(this.States.Disabled)
        })
    }

    // TODO: Define an 'enable' state function for when we want to show the cursor (and have it follow the mouse)
    startFollow = () => {
        const enabled = this.ecs.getComponent(this.entity, 'enabled') as Enabled
        enabled.active = true

        const sprite = this.ecs.getComponent(this.entity, 'sprite') as Sprite
        sprite.sprite.setActive(true).setVisible(true)
    }

    update = () => {
        const enabled = this.ecs.getComponent(this.entity, 'enabled') as Enabled
        if (enabled.active) {
            const transform = this.ecs.getComponent(this.entity, 'transform') as Transform
            // Mark the point in the world we might move to
            const toXmouse = Phaser.Math.Snap.To(this.scene.game.input.mousePointer.worldX, GRID_SIZE) / GRID_SIZE // Divide by grid size because our transforms are all based on 'world' coordinates (small grid) vs screen coords
            const toYmouse = Phaser.Math.Snap.To(this.scene.game.input.mousePointer.worldY, GRID_SIZE) / GRID_SIZE

            transform.x = toXmouse
            transform.y = toYmouse

            const collision = this.checkCollision(this.entity)
            if (collision) {
                const sprite = this.ecs.getComponent(this.entity, 'sprite') as Sprite
                sprite.sprite.tint = 0xff0000
            } else {
                const sprite = this.ecs.getComponent(this.entity, 'sprite') as Sprite
                sprite.sprite.clearTint()
            }
        }
    }

    // TODO Define a 'disable' state function for when we want to stop showing the cursor (and have it stop following)
    stopFollow = () => {
        const enabled = this.ecs.getComponent(this.entity, 'enabled') as Enabled
        enabled.active = false

        const sprite = this.ecs.getComponent(this.entity, 'sprite') as Sprite
        sprite.sprite.setActive(false).setVisible(false)
    }

    // We should display a translucent character that mimics the player sprite
    // We need to create a proper phaser sprite which will live in the component (even though this is breaking our rule of only state)

    createCursor = (playerEntity: string) => {
        const playerSprite = this.ecs.getComponent(playerEntity, 'sprite') as Sprite

        const _filename = playerSprite.sprite.texture.key

        // Create a phaser Sprite
        const _sprite = this.configureSprite(_filename)

        // Pass the phaser sprite into our Sprite component
        const sprite = new Sprite(_filename, _sprite)

        this.ecs.addComponent(this.entity, sprite)
    }

    // Configures our sprite before adding it to the scene
    configureSprite = (filename) => {
        const _sprite = this.scene.add.sprite(-100, -100, filename) // spawn our cursor offscreen and snap to cursor when available
        _sprite.alpha = 0.5
        _sprite.visible = false // Hide this character until we're ready to move
        _sprite.setDepth(DEPTH.Characters)
        return _sprite
    }

    checkCollision = (entity) => {
        let collision = false
        const transform = this.ecs.getComponent(entity, 'transform') as Transform

        // Get the list of transforms (That are not entity)
        const collidableEntities = this.ecs.getEntitiesByComponentType('collider') // Only grab entities with a physics colldier

        for (let i = 0; i < collidableEntities.length; i++) {
            const collidableTransform = this.ecs.getComponent(collidableEntities[i], 'transform') as Transform

            // Check if we're on top of a collidable entity
            if (transform.x == collidableTransform.x && transform.y == collidableTransform.y) {
                // Make sure we're not colliding with our own sprite
                if (!this.ecs.getComponent(collidableEntities[i], 'player')) {
                    collision = true
                }
            }
        }

        return collision
    }
}
