// revealed - Has this node been revealed yet?

import { IComponent } from '../engine/registry'

export class Reveal implements IComponent {
	public type = 'reveal'

	// Nodes need to be explicitly revealed
	public revealed = false
}
