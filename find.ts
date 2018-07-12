import fetch = require("isomorphic-fetch");
import T from "typed-github-api";


async function go() {
    const t = new T({ userAgent: "deep-rnn-intellisense" });
    for (const topic of "react,react-js,reactjs".split(",")) {
        const query = `topic:${topic} language:typescript`;
        const res = await t.searchRepositoriesAsync(query, undefined, undefined);
        for (const repo of res) {
            console.log(repo.htmlUri, repo.name, repo.description);
        }
    }
}

go();
