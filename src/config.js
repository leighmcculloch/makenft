import StellarSdk from 'stellar-sdk';

export function getConfig(network) {
    switch (network) {
        case "testnet":
            return {
                network: network,
                networkPassphrase: StellarSdk.Networks.TESTNET,
                horizonServer: new StellarSdk.Server("https://horizon-testnet.stellar.org"),
                viewUrl: (code, issuer) => `/👀.html#testnet:${code}:${issuer}`,
                explorerAssetUrl: (code, issuer) => `https://stellar.expert/explorer/testnet/asset/${code}-${issuer}`,
                explorerAssetHoldersUrl: (code, issuer) => `https://stellar.expert/explorer/testnet/asset/${code}-${issuer}?filter=asset-holders`,
                dexAssetUrl: (code, issuer) => `https://stellarterm.com/exchange/${code}-${issuer}/XLM-native`,
            };
        case "pubnet":
            return {
                network: network,
                networkPassphrase: StellarSdk.Networks.PUBNET,
                horizonServer: new StellarSdk.Server("https://horizon.stellar.org"),
                viewUrl: (code, issuer) => `/👀.html#${code}:${issuer}`,
                explorerAssetUrl: (code, issuer) => `https://stellar.expert/explorer/public/asset/${code}-${issuer}`,
                explorerAssetHoldersUrl: (code, issuer) => `https://stellar.expert/explorer/public/asset/${code}-${issuer}?filter=asset-holders`,
                dexAssetUrl: (code, issuer) => `https://stellarterm.com/exchange/${code}-${issuer}/XLM-native`,
            };
    }
}
