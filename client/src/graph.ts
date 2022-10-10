async function main() {

    // build directed straight line of length of crypt
    // get random edges from indexes from seed
    // add branches starting from edges
    const num = 16;
    const seed = 185323178;
    const max_edge_length = 8;

    const buildStraightLine = (start_index, length) => {
        let graph = [];
        for (let i = start_index; i <= length; i++) {
            graph.push({ src_identifier: i, dst_identifier: i + 1, weight: 0 });
        }
        return graph
    }


    const randomIndexes = (seed, graph) => {
        let length = seed % graph.length
        let indexes = [];
        for (let i = 0; i < length; i++) {
            indexes.push(graph[(seed + i * 123456789) % graph.length].src_identifier);
        }
        return indexes;
    }

    // TODO: add connector back to graph
    const buildBranches = (seed, indexes) => {
        let graph = [];
        let length = seed % max_edge_length

        for (let i = 0; i <= indexes.length; i++) {
            graph.push(buildStraightLine(indexes[i] * 100, length + indexes[i] * 100))
        }
        return graph.flatMap(x => x);
    }

    const graph = buildStraightLine(0, num);
    const indexes = randomIndexes(seed, graph);
    const branches = buildBranches(seed, indexes);

    const graph_full = graph.concat(branches);

    console.log(graph_full);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });