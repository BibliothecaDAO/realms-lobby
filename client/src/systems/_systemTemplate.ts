// template.ts - Copy/paste this to create a new system

import Phaser from 'phaser'
import { ISystem, Registry } from '../engine/registry'

export class TemplateSystem implements ISystem {
    private events: Phaser.Events.EventEmitter
    private ecs: Registry

    constructor(events: Phaser.Events.EventEmitter, ecs: Registry) {
        this.events = events
        this.ecs = ecs

        // Listen for events
    }

    update = () => {
        //
    }

    // Event responders

    // Utility functions
}
