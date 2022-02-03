import freighterApi from "@stellar/freighter-api";

export function isConnected() {
    return freighterApi.isConnected();
}

export async function getPublicKey() {
    return await freighterApi.getPublicKey();
}

export async function signTransaction(xdr, network) {
    let freighterNetwork = undefined;
    switch (network) {
        case "testnet":
            freighterNetwork = "TESTNET";
            break;
        case "pubnet":
            freighterNetwork = "PUBLIC";
            break;
        default:
            throw `Network '${network} unsupported by Freighter. Only pubnet and testnet are supported.`;
    }
    return await freighterApi.signTransaction(xdr, freighterNetwork);
}
