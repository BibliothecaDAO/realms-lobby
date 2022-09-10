// template.ts - What does this system do?

import EventEmitter from 'events'
import { ISystem, Registry } from '../engine/registry'

// Components

export class TemplateSystem implements ISystem {
    private events: EventEmitter
    private ecs: Registry

    constructor(events: EventEmitter, ecs: Registry) {
        this.events = events
        this.ecs = ecs

        // Listen for events
    }

    update = () => {
        //  Regular updates go here
    }

    // Event responders

    // Utility functions
}
