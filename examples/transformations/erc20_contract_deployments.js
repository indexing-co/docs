function main(block) {
  const newContracts = [];

  const erc20InterfaceSignatures = [
    "18160ddd", // totalSupply()
    "70a08231", // balanceOf(address)
    "a9059cbb", // transfer(address,uint256)
    "23b872dd", // transferFrom(address,address,uint256)
    "095ea7b3", // approve(address,uint256)
    "dd62ed3e", // allowance(address,address)
  ];

  for (const tx of block.transactions) {
    if (!tx.receipt || !tx.traces?.length) continue;

    for (let ti = 0; ti < tx.traces.length; ti += 1) {
      const result = tx.traces[ti].result;
      if (result?.address && result.code) {
        if (
          !erc20InterfaceSignatures.find((fourByte) =>
            result.code.includes(fourByte),
          )
        ) {
          continue;
        }

        newContracts.push({
          chain: block._network.toLowerCase(),
          timestamp: new Date(block.timestamp * 1000),
          transactionHash: tx.hash,
          traceIndex: ti,
          address: result.address.toLowerCase(),
        });
      }
    }
  }

  return newContracts;
}
