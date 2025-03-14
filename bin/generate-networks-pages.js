const fs = require("fs");
const docs = require("../docs.json");

async function run() {
  docs.navigation.tabs = docs.navigation.tabs.filter(
    (n) => n.tab !== "Networks",
  );

  const allNetworks = await fetch("https://jiti.indexing.co/networks").then(
    (r) => r.json(),
  );

  const networksTab = {
    tab: "Networks",
    groups: [
      {
        group: "Networks",
        pages: allNetworks.networks.map((n) => `networks/${n.key}`),
      },
    ],
  };

  docs.navigation.tabs.push(networksTab);

  fs.mkdirSync("networks", { recursive: true });
  for (const n of allNetworks.networks) {
    const previewLink = `https://jiti.indexing.co/networks/${n.key}/${n._status.lastBeat}`;
    const statusLink = `https://jiti.indexing.co/status/${n.key}`;

    const content = `---
title: '${n.name}'
description: 'Real time indexing for ${n.name}; delivered to you'
---

## Overview
- Network Key: \`${n.key}\`
- Estimated beat time: ${n._metadata.estimatedBeatTimeMS} ms

## Preview
Click the following link to view a preview of the raw data available: [${previewLink}](${previewLink})

## Status
Click here to view the latest status: [${statusLink}](${statusLink})
`;

    fs.writeFileSync(`networks/${n.key}.mdx`, content);
  }

  fs.writeFileSync("docs.json", JSON.stringify(docs, null, 2));
}

run().then(() => process.exit(0));
