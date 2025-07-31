function transform(block) {
  const POLYGON_MONEY_MARKET_EVENTS_BY_CONTRACT = {
    // Aave Pool
    "0x794a61358D6845594F94dc1DB02A252b5b4814aD": [
      "event Supply(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint16 indexed referralCode)",
      "event Withdraw(address indexed reserve, address indexed user, address indexed to, uint256 amount)",
      "event Borrow(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint8 interestRateMode, uint256 borrowRate, uint16 indexed referralCode)",
      "event Repay(address indexed reserve, address indexed user, address indexed repayer, uint256 amount, bool useATokens)",
      "event FlashLoan(address indexed target, address initiator, address indexed asset, uint256 amount, uint8 interestRateMode, uint256 premium, uint16 indexed referralCode)",
      "event UserEModeSet(address indexed user, uint8 categoryId)",
    ],

    // Compound V3 cUSDCv3
    "0xF25212E676D1F7F89Cd72fFEe66158f541246445": [
      "event Supply(address indexed from, address indexed dst, uint256 amount)",
      "event SupplyCollateral(address indexed from, address indexed dst, address indexed asset, uint256 amount)",
      "event WithdrawCollateral(address indexed src, address indexed to, address indexed asset, uint256 amount)",
      "event Withdraw(address indexed src, address indexed to, uint256 amount)",
    ],

    // Compound V3 cUSDTv3
    "0xaeB318360f27748Acb200CE616E389A6C9409a07": [
      "event Supply(address indexed from, address indexed dst, uint256 amount)",
      "event SupplyCollateral(address indexed from, address indexed dst, address indexed asset, uint256 amount)",
      "event WithdrawCollateral(address indexed src, address indexed to, address indexed asset, uint256 amount)",
      "event Withdraw(address indexed src, address indexed to, uint256 amount)",
    ],
  };

  const POLYGON_MONEY_MARKET_EVENTS = Object.entries(
    POLYGON_MONEY_MARKET_EVENTS_BY_CONTRACT,
  )
    .map(([address, signatures]) =>
      signatures.map((signature) => ({ address, signature })),
    )
    .flat();

  const events = [];

  for (const tx of block.transactions) {
    if (!tx.receipt) continue;

    for (const log of tx.receipt.logs) {
      try {
        const { metadata, decoded } = utils.evmDecodeLogWithMetadata(
          log,
          POLYGON_MONEY_MARKET_EVENTS,
        );

        if (metadata && decoded) {
          events.push({
            pool_address: log.address.toLowerCase(),
            transaction_hash: tx.hash,
            log_index: log.logIndex,
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            method: metadata.name.split(" ").pop(),
            wallet_address: (
              decoded.user ||
              decoded.from ||
              decoded.to
            )?.toLowerCase(),
            token_address: metadata.name.endsWith("Collateral")
              ? decoded.asset.toLowerCase()
              : null,
            amount:
              BigInt(decoded.amount) *
              BigInt(metadata.name.startsWith("Withdraw") ? -1 : 1),
          });
        }
      } catch (e) {
        // pass by unmatched logs
      }
    }
  }

  return events;
}
