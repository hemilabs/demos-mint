"use strict";

const { createPublicClient, http } = require("viem");
const { hemi } = require("hemi-viem");

const publicClient = createPublicClient({
  chain: hemi,
  transport: http(),
});

publicClient
  .readContract({
    abi: [
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    address: "0x70468F06CF32B776130E2Da4C0D7DD08983282EC",
    args: [],
    functionName: "owner",
  })
  .then(console.log)
  .catch(console.error);
