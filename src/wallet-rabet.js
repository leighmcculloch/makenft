export function isConnected() {
    return typeof window.rabet !== "undefined";
}

export async function getNetwork() {
    return null;
}

export async function getPublicKey() {
    const result = await window.rabet.connect();
    return result.publicKey;
}

export async function signTransaction(xdr, network) {
    let rabetNetwork = undefined;
    switch (network) {
        case "testnet":
            rabetNetwork = "testnet";
            break;
        case "pubnet":
            rabetNetwork = "mainnet";
            break;
        default:
            throw `Network '${network} unsupported by Rabet. Only pubnet and testnet are supported.`;
    }
    const result = await window.rabet.sign(xdr, rabetNetwork);
    return result.xdr;
}
