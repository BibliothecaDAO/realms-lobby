// selectButton.ts - Contains ui logic to select different items in the scene

import { GRID_SIZE } from '../../config'
import { Button } from '../button'

export class SelectButton extends Button {
    constructor(scene, state, size, callback) {
        const xOffset = -10 * GRID_SIZE
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
