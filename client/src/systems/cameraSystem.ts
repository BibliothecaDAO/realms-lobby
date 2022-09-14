// cameraSystem.ts - Camera should follow the player as they move around

import Phaser from 'phaser'
import { ISystem, Registry } from '../engine/registry'
import { GRID_SIZE } from '../config'

// Components
import { Sprite } from '../components/sprite'
import { Zone } from '../components/zone'

export class CameraSystem implements ISystem {
    private events: Phaser.Events.EventEmitter
    private ecs: Registry
    private scene: Phaser.Scene

    constructor(events: Phaser.Events.EventEmitter, ecs: Registry, scene: Phaser.Scene) {
        this.events = events
        this.ecs = ecs
        this.scene = scene

        // Listen for events
        this.events.on('spawnZone', this.setMapBounds)
        this.events.on('setupPlayer', this.enableCameraFollow)
    }

    update = () => {
        //
    }

    // Event responders
    // Set the bounds of the world so we know when to start panning
    setMapBounds = (entity, zone: Zone) => {
        // HACK - Zoom the screen and pan to player
        // If we call zoom in the game constructor, followPlayer breaks.
        this.scene.cameras.main.zoomTo(4, 100)

        // Set bounds of world to the same size as our tilemap.
        // This allows us to call world coordinates (e.g. via mouse pointer)
        this.scene.physics.world.setBounds(0, 0, zone.width * GRID_SIZE, zone.height * GRID_SIZE)

        // Setup camera to follow player around
        this.scene.cameras.main.setBounds(0, 0, zone.width * GRID_SIZE, zone.height * GRID_SIZE)
    }

    // Follow the player as they move around
    enableCameraFollow = (entity) => {
        const sprite = this.ecs.getComponent(entity, 'sprite') as Sprite
        this.scene.cameras.main.startFollow(sprite.sprite, true, 0.1, 0.1)
    }

    // Utility functions
}
