/* eslint-disable no-unused-labels */

// Template for a treasure chest in the game
// teasure chests can hold items
// contains the components to load for this object type and the default values that will be loaded unless overridden

{
	components: [
		{ type: 'transform', node: 0 },
		{
			type: 'sprite',
			name: 'treasurechest',
		},
		{
			type: 'inventory',
			items: [],
		},
	]
}
