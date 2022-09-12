// selectButton.ts - Contains ui logic to select different items in the scene

import { Button } from '../button'

export class SelectButton extends Button {
    constructor(scene, state, size, callback) {
        const xOffset = -40
        super(scene, state, xOffset, 0, size, size, '➤', { rotation: 43 }, callback)
    }

    enter = () => {
        this.toggleSelected()
        this.scene.input.setDefaultCursor('default')
    }

    exit = () => {
        this.toggleSelected()
    }
}
