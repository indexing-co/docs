function transform(block) {
  /**
    The following events include:
      Uniswap V3, V4
      Quickswap V2, V3
      Balancer V2
      SushiSwap V3, Red Snapper
      Curve
   */

  const POLYGON_DEX_EVENTS = [
    "event BKSwapV2(uint8 indexed swapType, address indexed receiver, uint256 feeAmount, string featureName, string featureVersion)",
    "event Burn(address indexed owner, int24 indexed bottomTick, int24 indexed topTick, uint128 liquidityAmount, uint256 amount0, uint256 amount1)",
    "event Burn(address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
    "event Collect(address indexed owner, address recipient, int24 indexed bottomTick, int24 indexed topTick, uint128 amount0, uint128 amount1)",
    "event Collect(address indexed owner, address recipient, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount0, uint128 amount1)",
    "event Collect(uint256 indexed tokenId, address recipient, uint256 amount0, uint256 amount1)",
    "event DecreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
    "event Exchange(address indexed sender, address indexed receiver, address[11] route, uint256[5][5] swap_params, address[5] pools, uint256 in_amount, uint256 out_amount)",
    "event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint128 actualLiquidity, uint256 amount0, uint256 amount1, address pool)",
    "event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
    "event Mint(address sender, address indexed owner, int24 indexed bottomTick, int24 indexed topTick, uint128 liquidityAmount, uint256 amount0, uint256 amount1)",
    "event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
    "event Minted(address indexed recipient, address gauge, uint256 minted)",
    "event ModifyLiquidity(bytes32 indexed id, address indexed sender, int24 tickLower, int24 tickUpper, int256 liquidityDelta, bytes32 salt)",
    "event PoolBalanceChanged(bytes32 indexed poolId, address indexed liquidityProvider, address[] tokens, int256[] deltas, uint256[] protocolFeeAmounts)",
    "event Swap(PoolId indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)",
    "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 price, uint128 liquidity, int24 tick)",
    "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
    "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)", // V2
    "event Swap(address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)", // V3
    "event Swap(bytes32 indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)", // V4
    "event Swap(address sender, uint256 inputAmount, address inputToken, uint256 amountOut, address outputToken, int256 slippage, uint32 referralCode)", // Seemed from Odos
    "event Swapped(uint256 amountIn, uint256 amountOut, address srcToken, address dstToken, address receiver, address sender, uint16 apiId)",
    "event TokenExchangeUnderlying(address indexed buyer, int128 sold_id, uint256 tokens_sold, int128 bought_id, uint256 tokens_bought)",
    "event UpdateLiquidityLimit(address indexed _user, uint256 _original_balance, uint256 _original_supply, uint256 _working_balance, uint256 _working_supply)",
    "event Withdraw(address indexed _user, uint256 _value)",
    "event WithdrawAndCollectAndSwap(address indexed nfpm, uint256 indexed tokenId, address token, uint256 amount)",
  ];

  const TRANSFER_EVENTS = [
    "event LogFeeTransfer(address indexed token, address indexed from, address indexed to, uint256 amount, uint256 input1, uint256 input2, uint256 output1, uint256 output2)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ];

  const events = [];
  const swaps = [];

  for (const tx of block.transactions) {
    if (!tx.receipt) continue;

    for (let i = 0; i < tx.receipt.logs.length; i += 1) {
      try {
        const log = tx.receipt.logs[i];

        const { metadata, decoded } = utils.evmDecodeLogWithMetadata(
          log,
          POLYGON_DEX_EVENTS,
        );

        if (metadata && decoded) {
          const method = metadata.name.split(" ").pop();
          const timestamp = new Date(block.timestamp * 1000).toISOString();

          // track all events
          events.push({
            contract_address: log.address.toLowerCase(),
            transaction_hash: tx.hash,
            log_index: log.logIndex,
            method,
            timestamp,
            decoded,
          });

          // also unify swap events
          if (["Swap", "Exchange", "Swapped"].includes(method)) {
            const [incomingTxfer, incomingTxferLog] = tx.receipt.logs
              .slice(i + 1)
              .reverse()
              .slice(0, 2)
              .map((log) => [
                utils.evmDecodeLogWithMetadata(log, TRANSFER_EVENTS),
                log,
              ])
              .find((v) => v[0]);
            const [outgoingTxfer, outgoingTxferLog] = tx.receipt.logs
              .slice(i + 1, i + 3)
              .map((log) => [
                utils.evmDecodeLogWithMetadata(log, TRANSFER_EVENTS),
                log,
              ])
              .find((v) => v[0]);
            if (!incomingTxfer || !outgoingTxfer) continue;

            const swap = {
              pool_address: log.address.toLowerCase(),
              transaction_hash: tx.hash,
              log_index: log.logIndex,
              timestamp,
              token_in_address: incomingTxferLog.address.toLowerCase(),
              token_in_amount: BigInt(
                incomingTxfer.decoded.value || incomingTxfer.decoded.amount,
              ),
              token_out_address: outgoingTxferLog.address.toLowerCase(),
              token_out_amount: BigInt(
                outgoingTxfer.decoded.value || outgoingTxfer.decoded.amount,
              ),
              from_address: incomingTxfer.from,
              to_address: outgoingTxfer.to,
            };

            swaps.push(swap);
          }
        }
      } catch (e) {
        // pass by unmatched logs
      }
    }
  }

  return {
    dex_events: events,
    swaps,
  };
}
