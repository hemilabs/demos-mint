"use strict";

const fs = require("fs");
const hemiViem = require("hemi-viem");
const pRetry = require("p-retry");

const pDoWhilst = require("./lib/p-do-whilst");

const tokenAddress = "0x70468F06CF32B776130E2Da4C0D7DD08983282EC"; // In Hemi Sepolia
const explorerUrl = hemiViem.hemiSepolia.blockExplorers.default.url;

async function getTokenHolders() {
  const holdersFile = fs.createWriteStream("holders.csv");
  holdersFile.write("address,balance\n");

  await pDoWhilst(
    async function (lastResponse = { count: 0 }) {
      const url = `${explorerUrl}/api/v2/tokens/${tokenAddress}/holders`;
      const query = new URLSearchParams(lastResponse.next_page_params || {});

      const { items, next_page_params } = await pRetry(
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

      items.forEach(function (item) {
        holdersFile.write(`${item.address.hash},${item.value}\n`);
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
