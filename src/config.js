import StellarSdk from 'stellar-sdk';

export function getConfig(network) {
    switch (network) {
        case "testnet":
            return {
                network: network,
                networkPassphrase: StellarSdk.Networks.TESTNET,
                horizonServer: new StellarSdk.Server("https://horizon-testnet.stellar.org"),
                ipfsUrl: (cid) => `https://ipfs.io/ipfs/${cid}`,
                viewUrl: (code, issuer) => `/view.html#testnet:${code}-${issuer}`,
                explorerAssetUrl: (code, issuer) => `https://stellar.expert/explorer/testnet/asset/${code}-${issuer}`,
                explorerAssetHoldersUrl: (code, issuer) => `https://stellar.expert/explorer/testnet/asset/${code}-${issuer}?filter=asset-holders`,
                dexAssetUrl: (code, issuer) => `https://stellarterm.com/exchange/${code}-${issuer}/XLM-native`,
            };
        case "pubnet":
            return {
                network: network,
                networkPassphrase: StellarSdk.Networks.PUBNET,
                horizonServer: new StellarSdk.Server("https://horizon.stellar.org"),
                ipfsUrl: (cid) => `https://ipfs.io/ipfs/${cid}`,
                viewUrl: (code, issuer) => `/view.html#${code}-${issuer}`,
                explorerAssetUrl: (code, issuer) => `https://stellar.expert/explorer/public/asset/${code}-${issuer}`,
                explorerAssetHoldersUrl: (code, issuer) => `https://stellar.expert/explorer/public/asset/${code}-${issuer}?filter=asset-holders`,
                dexAssetUrl: (code, issuer) => `https://stellarterm.com/exchange/${code}-${issuer}/XLM-native`,
            };
    }
}
