// graphGenerator.ts - Generates a a graph frmo a seed and a length 🍞
// Mirrors the cairo code we plan to deploy to generate dungeons from a C&C

// build directed straight line of length of crypt
// get random edges from indexes from seed
// add branches starting from edges

export class GraphGenerator {
	// Input from smart contract
	public seed: number // Seed is taken from the Crypts and Caverns dungeon token for this dungeon
	public length: number // Length is taken from the size (e.g. 20x20) of the C&C dungeon

	// constants
	private max_edge_length = 8

	constructor(seed: number, length: number) {
		this.seed = seed
		this.length = length
	}

	generate = () => {
		const graph = this.buildStraightLine(0, this.length)
		const indexes = this.randomIndexes(this.seed, graph)
		const branches = this.buildBranches(this.seed, indexes)

		const graph_full = graph.concat(branches)

		const entities = this.randomIndexes(this.seed, graph_full)

		// Format graph for use in the game (expects an array of arrays)
		return this.formatGraph({ graph: graph_full, entities: entities })
	}

	buildStraightLine = (start_index, length) => {
		const graph = []
		for (let i = start_index; i <= length; i++) {
			graph.push({ src_identifier: i, dst_identifier: i + 1, weight: 1 })
		}
		return graph
	}

	randomIndexes = (seed, graph) => {
		const l = graph.length

		const length = seed % l

		const indexes = []
		for (let i = 0; i < length; i++) {
			indexes.push(graph[(seed + i * 123456789) % graph.length].src_identifier)
		}
		return indexes
	}

	buildBranches = (seed, indexes) => {
		const graph = []
		for (let i = 0; i < indexes.length; i++) {
			const length = (seed + i * 123456789) % this.max_edge_length

			// connect to random index
			graph.push({
				src_identifier: indexes[i],
				dst_identifier: indexes[i] * 100,
				weight: 1,
			})

			// build branch
			graph.push(
				this.buildStraightLine(indexes[i] * 100, length - 1 + indexes[i] * 100)
			)

			// connect branch to random index - TODO: this is not right
			// TODO - Create automated test to run through crypt seeds and see if it spits out NaN
			const connecting_node = (seed + i * 123456789) % length

			// add connection back to graph
			graph.push({
				src_identifier: indexes[i] * 100 + length,
				dst_identifier: connecting_node,
				weight: 1,
			})
		}
		return graph.flatMap((x) => x)
	}

	// Format the graph to flat arrays (which the client will expect)
	// [
	// [0, 1, 1],
	// [1, 2, 1],
	// [2, 1, 1]
	// ]
	formatGraph = (json) => {
		const graph = []

		for (let i = 0; i < json.graph.length; i++) {
			const edge = json.graph[i]

			graph.push([edge.src_identifier, edge.dst_identifier, edge.weight])
		}
		return graph
	}
}
