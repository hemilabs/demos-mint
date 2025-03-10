"use strict";

const { createWriteStream } = require("fs");
const { hemiSepolia } = require("hemi-viem");
const pRetry = require("p-retry");

const pDoWhilst = require("./lib/p-do-whilst");

const explorerUrl = hemiSepolia.blockExplorers.default.url;
const tokenAddress = "0x70468F06CF32B776130E2Da4C0D7DD08983282EC"; // In Hemi Sepolia
const url = `${explorerUrl}/api/v2/tokens/${tokenAddress}/holders`;

const getHoldersPage = function (next_page_params = {}) {
  const query = new URLSearchParams(next_page_params);
  return pRetry(
    async function () {
      const res = await fetch(`${url}?${query.toString()}`);
      return res.json();
    },
    {
      onFailedAttempt(err) {
        console.error(err.message);
      },
      retries: Infinity,
    }
  );
};

async function getTokenHolders() {
  const holdersFile = createWriteStream("holders.txt");

  // Get all holders pages from the explorer API and write them to a file
  await pDoWhilst(
    async function (lastResponse = { count: 0 }) {
      const { items, next_page_params } = await getHoldersPage(
        lastResponse.next_page_params
      );
      items.forEach(function (item) {
        holdersFile.write(`${item.address.hash}\n`);
      });
      return {
        count: lastResponse.count + items.length,
        next_page_params,
      };
    },
    function (response) {
      console.log(response.count);
      return response.next_page_params;
    }
  );

  holdersFile.end();
}

getTokenHolders();
