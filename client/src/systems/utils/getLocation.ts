// getLocation - returns an x, y (screen) position for a given node in the graph

export const getLocation = (node: number, graph) => {
	// How far from the edge of the canvas should we draw each node?
	const xOffset = 150
	const yOffset = 150

	// Spread nodes out based on depth in graph.
	// E.g. root node is at depth 0, next set of nodes is at depth 1 (to the right), etc.
	// This gives us a left -> right view of our graph.

	// Get the depth of the current node
	const depth = graph.depth.get(node)
	const x = xOffset * depth

	// Determine how many nodes we should draw at this depth
	// Space them out evenly based on the number of nodes at this depth
	// e.g. if we have 3 nodes at depth 1, we should draw them at 1/4, 2/4, and 3/4 of the canvas height

	// Get the number of nodes at this depth
	const depthList = graph.depthList.get(depth)

	// Determine this node's position at this depth
	const depthIndex = depthList.indexOf(node)

	let y
	if (graph.reverseAdjacency.get(0).includes(node)) {
		// HACK - This connects to the root node, draw it at the top
		y = yOffset * (depthIndex - 2)
	} else if (graph.reverseAdjacency.get(node).length > 1) {
		// HACK - Catch nodes with multiple adjacencies
		y = yOffset * depthIndex + 1
	} else {
		y = yOffset * (depthIndex - 1) // we subtract 1 so our graph is centered vertically
	}

	return { x: x, y: y }
}
