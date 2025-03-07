# Helpers to mint DEMOS tokens

Install the dependencies.

```sh
npm install
```

Then obtain the list of OnlyMeID holders in Hemi Sepolia.

```sh
node get-token-holders.js
```

With the list of holders in the `holders.csv` file, mint the tokens again in the Hemi mainnet.

```sh
node mint-tokens.js
```
