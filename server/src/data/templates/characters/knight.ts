/* eslint-disable no-unused-labels */

// Template for a player in the game
// contains the components to load for this object type and the default values that will be loaded unless overridden

{
	components: [
		{ type: 'transform', node: 0 }, // Players always spawn at start of dungeon
		{
			type: 'sprite',
			name: 'knight',
		},
		{
			type: 'inventory',
			items: [], // Player spawns w/ empty inventory
		},
	]
}
