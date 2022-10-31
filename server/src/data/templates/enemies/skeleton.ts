/* eslint-disable no-unused-labels */

// Template for a skeleton enemy
// contains the components to load for this object type and the default values that will be loaded unless overridden

{
	components: [
		{ type: 'transform', node: 204 },
		{
			type: 'sprite',
			name: 'skeleton',
		},
		{
			type: 'health',
			amount: '5',
		},
		{
			type: 'weapon',
			damage: '2',
			delay: '10',
		},
		{
			type: 'inventory',
			items: [], // Monsters spawn w/ empty inventory (can be overridden by loot tables)
		},
	]
}
