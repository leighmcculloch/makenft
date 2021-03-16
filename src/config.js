import StellarSdk from 'stellar-sdk';

export function getConfig(network) {
    switch (network) {
        case "testnet":
            return {
                network: network,
                networkPassphrase: StellarSdk.Networks.TESTNET,
                horizonServer: new StellarSdk.Server("https://horizon-testnet.stellar.org"),
                explorerAssetUrl: (code, issuer) => `https://stellar.expert/explorer/testnet/asset/${code}-${issuer}`,
            };
        case "pubnet":
            return {
                network: network,
                networkPassphrase: StellarSdk.Networks.PUBNET,
                horizonServer: new StellarSdk.Server("https://horizon.stellar.org"),
                explorerAssetUrl: (code, issuer) => `https://stellar.expert/explorer/public/asset/${code}-${issuer}`,
            };
    }
}
