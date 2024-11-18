# Axelar <-> Secret  ICS20 bridge testing

## Installation


```sh
# Install dependencies
bun install
# npm / pnpm / yarn should also work
```

```sh
# modify .env file or copy exisitng
cp .env.sample .env
```

## Prerequesites

- Address derived from SECRET_MNEMONIC must have some balance in SNIP20 contract specified in `configs` folder. 
- ICS20 contract must be an authorised minter of SNIP20
- Both SNIP20 and IBC channel from config file must be in ALLOWED_DENOMS of the ICS20 contract 
- There is a relayer passing messages from custom (wasm.secret1...) port of ICS20 (and configured channel) to transfer port of consumer chain

## Running
```
# Replace `bun` with desired package manager if needed

# To run all test including ones checking configuration
bun run test

# To test ics20 transfer only
bun run test token
```
