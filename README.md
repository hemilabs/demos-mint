# Helpers to mint DEMOS tokens

Install the dependencies.

```sh
npm install
```

Then obtain the list of `OnlyMeID` holders in Hemi Sepolia.

```sh
node get-token-holders.js
```

With the list of holders in the `holders.txt` file and `PRIVATE_KEY` set in the environment or in a `.env` file, mint the tokens in the Hemi mainnet.

```sh
node mint-tokens.js
```
