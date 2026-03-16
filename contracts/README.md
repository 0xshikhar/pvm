# Local development

npx hardhat --network hardhat deploy

# Testnet (Paseo)

npx hardhat --network paseoAssetHub deploy

# Testnet (Westend)

npx hardhat --network westendAssetHub deploy

# Or use npm scripts (require PRIVATE_KEY env var for non-local)

npm run deploy:local
npm run deploy:paseo
npm run deploy:westend
