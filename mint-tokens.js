"use strict";

const {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
} = require("viem");
const { hemi } = require("hemi-viem");
const { privateKeyToAccount } = require("viem/accounts");
const { readFileSync } = require("fs");

try {
  process.loadEnvFile();
} catch (err) {
  // Ignore the error
}

const MINT_TOKENS = process.env.MINT_TOKENS === "true";
const PRIVATE_KEY = /** @type {`0x${string}`} */ (process.env.PRIVATE_KEY);
const BATCH_SIZE = 50;

const tokenContract = {
  abi: [
    {
      inputs: [
        { internalType: "address[]", name: "_users", type: "address[]" },
      ],
      name: "adminMint",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "OwnableUnauthorizedAccount",
      type: "error",
    },
  ],
  address: /** @type {`0x${string}`} */ (
    "0x70468F06CF32B776130E2Da4C0D7DD08983282EC" // In Hemi mainnet
  ),
};

const publicClient = createPublicClient({
  chain: hemi,
  transport: http(undefined, { batch: { batchSize: BATCH_SIZE } }),
});
const walletClient = createWalletClient({
  account: privateKeyToAccount(PRIVATE_KEY),
  chain: hemi,
  transport: http(),
});

async function estimateBatch(addresses) {
  console.log(`Estimating batch of ${addresses.length} addresses`);
  const gas = await publicClient.estimateGas({
    account: walletClient.account,
    data: encodeFunctionData({
      abi: tokenContract.abi,
      args: [addresses],
      functionName: "adminMint",
    }),
    to: tokenContract.address,
  });
  console.log(`Estimated gas: ${gas}`);
}

async function mintBatch(addresses) {
  console.log(`Minting batch of ${addresses.length} addresses`);
  const hash = await walletClient.writeContract({
    ...tokenContract,
    args: [addresses],
    functionName: "adminMint",
  });
  console.log(`Transaction hash: ${hash}`);
}

async function mintTokens() {
  // Parse the CSV file and remove the header
  const csvContent = readFileSync("holders.csv", "utf-8");
  const records = csvContent
    .split("\n")
    .map((line) => ({ address: line.split(",")[0] }));
  records.shift();

  // Split the records in chunks having at most BATCH_SIZE elements each
  const chunks = Array.from(
    { length: Math.ceil(records.length / BATCH_SIZE) },
    (_, i) => records.slice(i * BATCH_SIZE, i * BATCH_SIZE + BATCH_SIZE)
  );

  for (const chunk of chunks) {
    // For each chunk, check the balance of each address and keep only the ones
    // with 0 balance
    const addresses = await Promise.all(
      chunk.map(async function ({ address }) {
        const balance = await publicClient.readContract({
          ...tokenContract,
          args: [address],
          functionName: "balanceOf",
        });
        return balance === 0n ? address : null;
      })
    );
    const filtered = addresses.filter(Boolean);

    // If there are no addresses left in the batch, skip it
    if (!filtered.length) {
      return;
    }

    // Otherwise, mint the tokens (or estimate the gas cost)
    if (MINT_TOKENS) {
      await mintBatch(filtered);
    } else {
      await estimateBatch(filtered);
    }
  }
}

mintTokens();
