// movemode.ts - Enable a 'move' mode where we pathfind from one point to another
// TODO - Consider splitting system into 'pathfinding' and 'renderpath' or 'moveMode' and 'drawPath'?

import { ISystem, Registry } from '../engine/registry'
import { js as Finder } from 'easystarjs' // https://github.com/prettymuchbryce/easystarjs
import { GameObjects } from 'phaser'

import { DEPTH, GRID_SIZE } from '../config'
import { Transform } from '../components/transform'
import { MoveMode } from '../components/movemode'

export class MoveModeSystem implements ISystem {
    private events: Phaser.Events.EventEmitter
    private ecs: Registry
    private scene: Phaser.Scene

    private finder: Finder

    private debugCursor: Phaser.GameObjects.Text

    constructor(events: Phaser.Events.EventEmitter, ecs: Registry, scene: Phaser.Scene, finder: Finder) {
        this.events = events
        this.ecs = ecs
        this.scene = scene
        this.finder = finder // We now setup pathfinding in mapSystem

        // Listen for events
        // Player is trying to pick a spot to move to, start calculating paths
        this.events.on('startmoving', this.enableMoveMode)
        // Player finished trying to pick a spot to move to, stop calculating paths
        this.events.on('stopmoving', this.disableMoveMode)
    }

    update = () => {
        // Check if any entities are in move mode
        const entities = this.ecs.getEntitiesByComponentType('movemode')

        if (entities && entities.length > 0) {
            // Iterate through each entity in move mode
            for (let i = 0; i < entities.length; i++) {
                const transform = this.ecs.getComponent(entities[i], 'transform') as Transform

                // Calculate where we want to move 'from' and where we want to move 'to'
                // From - current character position
                const fromX = transform.x
                const fromY = transform.y

                // Convert pointer world coordinates and convert to our map so we can calculate the path
                const toX = Math.floor(Phaser.Math.Snap.To(this.scene.input.mousePointer.worldX, GRID_SIZE) / GRID_SIZE)
                const toY = Math.floor(Phaser.Math.Snap.To(this.scene.input.mousePointer.worldY + 30, GRID_SIZE) / GRID_SIZE) // Adjusts display position based on

                const moveMode = this.ecs.getComponent(entities[i], 'movemode') as MoveMode

                // Only recalculatepath if we've moved the mouse to another grid spot
                if (toX != moveMode.lastX || toY != moveMode.lastY) {
                    moveMode.lastX = toX
                    moveMode.lastY = toY

                    // Get rid of our last line
                    this.destroyPath(moveMode.line)

                    // Create a new pathfinding line
                    this.checkPath(fromX, fromY, toX, toY, (path) => {
                        this.drawPath(path, entities[i])
                    })
                }
            }
        }
    }

    // Event responders
    enableMoveMode = (entity) => {
        // Set this entity into 'movemode'
        const moveMode = new MoveMode()
        this.ecs.addComponent(entity, moveMode)

        // Initialize empty array
        moveMode.line = []

        // Listen for mouse clicks when we're in 'move' mode
        this.scene.input.on('pointerdown', (pointer) => {
            const moveMode = this.ecs.getComponent(entity, 'movemode') as MoveMode

            // Make sure the spot isn't occupied
            const collide = this.validateMove(moveMode.lastX, moveMode.lastY)

            if (!collide) {
                // Move the player
                this.events.emit('input:move', moveMode.lastX, moveMode.lastY)

                // Clear out our line
                this.destroyPath(moveMode.line)
            }
        })
    }

    disableMoveMode = (entity) => {
        const moveMode = this.ecs.getComponent(entity, 'movemode') as MoveMode
        this.destroyPath(moveMode.line)
        moveMode.line = []

        // Remove the move component so we don't trigger moveMode
        this.ecs.removeComponent(entity, moveMode)

        this.scene.input.off('pointerdown')
    }

    // TODO - Figure out where to put the collision check client-side
    // Utility functions
    drawPath = (path, entity) => {
        if (path) {
            const moveMode = this.ecs.getComponent(entity, 'movemode') as MoveMode
            // Draw our path
            // We don't draw the first or last point so we don't occlude our character or cursor
            const end = path.length > 1 ? path.length - 1 : path.length
            for (let i = 1; i < end; i++) {
                // Adjust where we draw when we scroll the map
                moveMode.line[i] = this.scene.add.circle(path[i].x * GRID_SIZE, path[i].y * GRID_SIZE, 2, 0xfffdfd0f)
                moveMode.line[i].setDepth(DEPTH.Terrain)
            }
        }
    }

    destroyPath = (line: GameObjects.Arc[]) => {
        // Clear last line (if one exists)
        if (line && line.length > 0) {
            for (let i = 1; i < line.length; i++) {
                line[i].destroy() // Delete existing game objects
                // TODO - Figure out a more efficient way to manage this line (e.g. turn on/off pixels)
            }
        }
    }

    // Checks whehter a path from (x1, y1) to (x2, y2) is valid
    public checkPath = (fromX: integer, fromY: integer, toX: integer, toY: integer, callback) => {
        this.finder.findPath(fromX, fromY, toX, toY, callback)

        this.finder.calculate()
    }

    // Make sure no entity is occupying the space we're moving to
    validateMove = (x: number, y: number) => {
        // Get a list of entities that have colliders
        const listOfCollidableEntities = this.ecs.getEntitiesByComponentType('collider')

        let collide = false

        // Check if any collidable entities are located where we're trying to move
        for (let i = 0; i < listOfCollidableEntities.length; i++) {
            const transform = this.ecs.getComponent(listOfCollidableEntities[i], 'transform') as Transform
            if (transform) {
                if (x == transform.x && y == transform.y) {
                    collide = true
                }
            }
        }

        return collide
    }
}
