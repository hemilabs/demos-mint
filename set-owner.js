"use strict";

const { createWalletClient, http } = require("viem");
const { hemi } = require("hemi-viem");
const { privateKeyToAccount } = require("viem/accounts");

try {
  process.loadEnvFile();
} catch (err) {
  // Ignore the error
}

const PRIVATE_KEY = /** @type {`0x${string}`} */ (process.env.PRIVATE_KEY);

const walletClient = createWalletClient({
  account: privateKeyToAccount(PRIVATE_KEY),
  chain: hemi,
  transport: http(),
});

walletClient
  .writeContract({
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "newOwner",
            type: "address",
          },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    address: "0x70468F06CF32B776130E2Da4C0D7DD08983282EC",
    args: ["0xb13e9b16bFA49E8E68FFc5e868F68fd3d3ac1cf2"],
    functionName: "transferOwnership",
  })
  .then(console.log)
  .catch(console.error);
