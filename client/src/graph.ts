async function main() {

    // build directed straight line of length of crypt
    // get random edges from indexes from seed
    // add branches starting from edges
    const num = 16;
    const seed = 2153178;
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
        for (let i = 0; i < indexes.length; i++) {

            // TODO: fix this
            let length = (seed + i * 123456789) % max_edge_length

            // connect to random index
            graph.push({ src_identifier: indexes[i], dst_identifier: indexes[i] * 100, weight: 0 });

            // build branch
            graph.push(buildStraightLine(indexes[i] * 100, length + indexes[i] * 100))

            // connect branch to random index
            let connecting_node = (seed + indexes[i] * 123546) % num

            // add connection back to graph
            graph.push({ src_identifier: indexes[i] * 100 + length, dst_identifier: connecting_node, weight: 0 });
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