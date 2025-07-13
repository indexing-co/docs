function transform(block) {
  const POLYGON_DEX_EVENTS_BY_CONTRACT = {
    // Uniswap V4 Router
    "0x1095692A6237d83C6a72F3F5eFEdb9A670C49223": [
      "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)", // V2
      "event Swap(address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)", // V3
      "event Swap(PoolId indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)",
      "event Swap(address sender, uint256 inputAmount, address inputToken, uint256 amountOut, address outputToken, int256 slippage, uint32 referralCode)", // Seemed from Odos
    ],

    // Uniswap V4 Position Manager
    "0x1Ec2eBf4F37E7363FDfe3551602425af0B3ceef9": [
      "event ModifyLiquidity(bytes32 indexed id, address indexed sender, int24 tickLower, int24 tickUpper, int256 liquidityDelta, bytes32 salt)",
    ],

    // Uniswap V3 Router
    "0xE592427A0AEce92De3Edee1F18E0157C05861564": [
      "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)", // V2
      "event Swap(address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)", // V3
      "event Swap(PoolId indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)",
      "event Swap(address sender, uint256 inputAmount, address inputToken, uint256 amountOut, address outputToken, int256 slippage, uint32 referralCode)", // Seemed from Odos
    ],

    // Uniswap V3 Non-fungible Position Manager
    "0xC36442b4a4522E871399CD717aBDD847Ab11FE88": [
      "event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
      "event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
      "event Burn(address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
      "event DecreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
      "event Collect(address indexed owner, address recipient, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount0, uint128 amount1)",
    ],

    // Quickswap V2 Router
    "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff": [
      "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
    ],

    // Quickswap V3 Router
    "0xf5b509bB0909a69B1c207E495f687a596C168E12": [
      "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 price, uint128 liquidity, int24 tick)",
    ],

    // Quickswap Non-fungible position manager
    "0x8eF88E4c7CfbbaC1C163f7eddd4B578792201de6": [
      "event Mint(address sender, address indexed owner, int24 indexed bottomTick, int24 indexed topTick, uint128 liquidityAmount, uint256 amount0, uint256 amount1)",
      "event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint128 actualLiquidity, uint256 amount0, uint256 amount1, address pool)",
      "event Burn(address indexed owner, int24 indexed bottomTick, int24 indexed topTick, uint128 liquidityAmount, uint256 amount0, uint256 amount1)",
      "event Collect(uint256 indexed tokenId, address recipient, uint256 amount0, uint256 amount1)",
      "event Collect(address indexed owner, address recipient, int24 indexed bottomTick, int24 indexed topTick, uint128 amount0, uint128 amount1)",
      "event DecreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
      "event WithdrawAndCollectAndSwap(address indexed nfpm, uint256 indexed tokenId, address token, uint256 amount)",
    ],

    // Balancer V2 Relayer
    "0xB1ED8d3b5059b3281D43306cC9D043cE8B22599b": [
      "event UpdateLiquidityLimit(address indexed _user, uint256 _original_balance, uint256 _original_supply, uint256 _working_balance, uint256 _working_supply)",
      "event Minted(address indexed recipient, address gauge, uint256 minted)",
      "event PoolBalanceChanged(bytes32 indexed poolId, address indexed liquidityProvider, address[] tokens, int256[] deltas, uint256[] protocolFeeAmounts)",
      "event Withdraw(address indexed _user, uint256 _value)",
    ],

    // SushiSwap Red Snwapper
    "0xAC4c6e212A361c968F1725b4d055b47E63F80b75": [
      "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
      "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
    ],

    // SushiSwap V3 Position Manager
    "0xb7402ee99F0A008e461098AC3A27F4957Df89a40": [
      "event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
      "event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
      "event Burn(address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
      "event DecreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
      "event Collect(address indexed owner, address recipient, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount0, uint128 amount1)",
      "event Collect(uint256 indexed tokenId, address recipient, uint256 amount0, uint256 amount1)",
    ],

    // Curve Router
    "0x0DCDED3545D565bA3B19E683431381007245d983": [
      "event Exchange(address indexed sender, address indexed receiver, address[11] route, uint256[5][5] swap_params, address[5] pools, uint256 in_amount, uint256 out_amount)",
      "event TokenExchangeUnderlying(address indexed buyer, int128 sold_id, uint256 tokens_sold, int128 bought_id, uint256 tokens_bought)",
      "event Swapped(uint256 amountIn, uint256 amountOut, address srcToken, address dstToken, address receiver, address sender, uint16 apiId)",
      "event BKSwapV2(uint8 indexed swapType, address indexed receiver, uint256 feeAmount, string featureName, string featureVersion)",
    ],
  };

  const POLYGON_DEX_EVENTS = Object.entries(POLYGON_DEX_EVENTS_BY_CONTRACT)
    .map(([address, signatures]) =>
      signatures.map((signature) => ({ address, signature })),
    )
    .flat();

  const events = [];
  const swaps = [];

  for (const tx of block.transactions) {
    if (!tx.receipt) continue;

    // memoize token transfers if we detect a swap
    let transfers;

    for (const log of tx.receipt.logs) {
      try {
        const { metadata, decoded } = utils.evmDecodeLog(
          log,
          POLYGON_DEX_EVENTS,
        );

        if (metadata && decoded) {
          const timestamp = new Date(block.timestamp * 1000).toISOString();

          // track all events
          events.push({
            contract_address: log.address.toLowerCase(),
            transaction_hash: tx.hash,
            log_index: log.logIndex,
            method: metadata.name,
            timestamp,
            decoded,
          });

          // also unify swap events
          if (metadata.name.includes("Swap")) {
            if (!transfers) {
              transfers = templates.token_transfers({
                ...block,
                transactions: [tx],
              });
            }

            const swap = {
              contract_address: log.address.toLowerCase(),
              transaction_hash: tx.hash,
              log_index: log.logIndex,
              timestamp,
              token_in_address: null,
              token_in_amount: null,
              token_out_address: null,
              token_out_amount: null,
              from_address: null,
              to_address: null,
            };

            const matchingTransfers = []; // @TODO

            swaps.push(swap);
          }
        }
      } catch (e) {
        // pass by unmatched logs
      }
    }
  }

  return {
    events,
    swaps,
  };
}
