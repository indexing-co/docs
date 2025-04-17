const fs = require("fs");
const docs = require("../docs.json");

async function run() {
  docs.navigation.tabs = docs.navigation.tabs.filter(
    (n) => n.tab !== "Networks",
  );

  const allNetworks = await fetch("https://jiti.indexing.co/status").then((r) =>
    r.json(),
  );

  const networksTab = {
    tab: "Networks",
    groups: [
      {
        group: "Overview",
        pages: ["networks/overview"],
      },
      {
        group: "Networks",
        pages: allNetworks.networks.map(
          (n) => `networks/${n.key.toLowerCase()}`,
        ),
      },
    ],
  };

  docs.navigation.tabs.push(networksTab);
  fs.rmdirSync("networks", { recursive: true });
  fs.mkdirSync("networks", { recursive: true });

  fs.writeFileSync(
    "networks/overview.mdx",
    `---
title: 'The Networks'
description: '${allNetworks.networks.length} supported networks and counting'
---

Indexing Co supports ${allNetworks.networks.length} networks. _All_ of these are available for real time processing in The Neighborhood.

While the vast majority of these networks are blockchains themselves, we can also support offchain sources such as Farcaster.

The most up to date list can be viewed via an API [here](https://jiti.indexing.co/networks)

<Note>
Don't see what you need? Reach out!\n
We can usually onboard any network within 24 hours
</Note>

# SLAs
We pass along the uptime guarantees of our RPC providers. This varies by chain, but is generally 99.9% or better. For our internal infrastructure, we maintain a 99.95% uptime.

View more about how we support networks and working with us [here](https://indexing-co.notion.site/Indexing-Co-and-You-15e25f03105380489b3fecdc2f6d8408).
`,
  );

  for (const n of allNetworks.networks) {
    const previewLink = `https://jiti.indexing.co/networks/${n.key}/${n.lastBeat}`;
    const statusLink = `https://jiti.indexing.co/status/${n.key}`;

    const content = `---
title: '${n.name}'
description: 'Real time indexing for ${n.name}; delivered to you'
---

# Overview
- Network Key: \`${n.key}\`

# Preview
Click the following link to view a preview of the raw data available: [${previewLink}](${previewLink})

# Status
Click here to view the latest status: [${statusLink}](${statusLink})
`;

    fs.writeFileSync(`networks/${n.key.toLowerCase()}.mdx`, content);
  }

  fs.writeFileSync("docs.json", JSON.stringify(docs, null, 2));
}

run().then(() => process.exit(0));
