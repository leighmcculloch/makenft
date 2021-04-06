import StellarSdk from 'stellar-sdk';
import * as ipfsCore from 'ipfs-core';
import * as config from './config.js';

const version = `${process.env.VERSION || "dev"}`;
console.log(`Version: ${version}`);

window.init = wrapErrorHandling(init);

async function init() {
    const url = window.location.href;
    const hashIndex = url.indexOf("#");
    if (hashIndex === -1) {
        throw new Error("NFT not specified in web address.")
    }
    const hash = url.substring(hashIndex + 1);

    const hashParts = hash.split(":", 2);
    let network = undefined;
    let asset = undefined;
    if (hashParts.length == 1) {
        network = "pubnet";
        asset = hashParts[0];
    } else if (hashParts.length == 2) {
        network = hashParts[0];
        asset = hashParts[1];
    } else {
        throw new Error("NFT web address malformed.")
    }

    const assetParts = asset.split("-", 2);
    if (assetParts.length !== 2) {
        throw new Error("NFT web address malformed.")
    }
    const code = assetParts[0];
    const issuer = assetParts[1];

    const cfg = config.getConfig(network);

    const account = await cfg.horizonServer.loadAccount(issuer);

    let nftAssetUrl = "";
    for (let i = 0; ; i++) {
        const value = account.data_attr[`nft.asset.url[${i}]`];
        if (typeof value === "undefined") {
            break;
        }
        nftAssetUrl += atob(value);
    }
    let nftAssetUrlLink = nftAssetUrl;
    if (nftAssetUrl.startsWith("ipfs://")) {
        nftAssetUrlLink = cfg.ipfsUrl(nftAssetUrl.substring(7));
    }
    const nftAssetHash = (() => {
        const sha256 = account.data_attr[`nft.asset.sha256`];
        if (sha256) {
            return atob(sha256);
        }
        return null;
    })();

    let nftMetaUrl = "";
    for (let i = 0; ; i++) {
        const value = account.data_attr[`nft.meta.url[${i}]`];
        if (typeof value === "undefined") {
            break;
        }
        nftMetaUrl += atob(value);
    }
    let nftMetaUrlLink = nftAssetUrl;
    if (nftMetaUrl.startsWith("ipfs://")) {
        nftMetaUrlLink = cfg.ipfsUrl(nftMetaUrl.substring(7));
    }
    const nftMetaHash = (() => {
        const sha256 = account.data_attr[`nft.meta.sha256`];
        if (sha256) {
            return atob(sha256);
        }
        return null;
    })();

    document.getElementById("code").innerText = code;
    const preview = document.createElement("img");
    preview.src = nftAssetUrlLink;
    const filePreview = document.getElementById("file-preview");
    while (filePreview.firstChild) {
        filePreview.removeChild(filePreview.firstChild);
    }
    filePreview.appendChild(preview);

    let text =
        `Asset: <a href="${nftAssetUrlLink}">${nftAssetUrl}</a>`;
    if (nftAssetHash) {
        text += `<br/>` +
            `Hash: ${nftAssetHash}`;
    }
    resultData(text);

    let meta = "";
    if (nftMetaUrl !== "") {
        meta += `Meta: <a href="${nftMetaUrlLink}">${nftMetaUrl}</a>`;
    }
    if (nftMetaHash) {
        meta += `<br/>` +
            `Hash: ${nftMetaHash}`;
    }
    if (nftMetaUrl !== "" && nftMetaUrl.startsWith("ipfs://")) {
        const nftMetaCid = nftMetaUrl.substring(7);
        const ipfsNode = await getIpfsNode();
        const stream = ipfsNode.cat(nftMetaCid);
        let nftMetaData = "";
        for await (const chunk of stream) {
            nftMetaData += chunk.toString()
        }
        const nftMetaJson = JSON.parse(nftMetaData);
        const metaJsonHtml = `${JSON.stringify(nftMetaJson, null, "  ")}`;
        resultMetaJson(metaJsonHtml);
    }
    if (meta !== "") {
        resultMeta(meta);
    }

    resultSuccess(
        `View on a <a href="${cfg.explorerAssetUrl(code, issuer)}">block explorer</a>.</br>` +
        `See the current owner(s) <a href="${cfg.explorerAssetHoldersUrl(code, issuer)}">here</a>.</br>` +
        `Make an offer to buy or sell this NFT using a <a href="${cfg.dexAssetUrl(code, issuer)}">DEX app</a>.`
    );
}

function wrapErrorHandling(f) {
    return async () => {
        try {
            await f();
        } catch (error) {
            resultError(error.error || error);
            throw error;
        }
    };
}

function resultError(error) {
    const result = document.getElementById("result");
    result.innerText = error.toString();
}

function resultSuccess(html) {
    const result = document.getElementById("result");
    result.innerHTML = html;
}

function resultData(html) {
    const result = document.getElementById("result-data");
    result.innerHTML = html;
}

function resultMeta(html) {
    const result = document.getElementById("result-meta");
    result.innerHTML = html;
}

function resultMetaJson(html) {
    const result = document.getElementById("result-meta-json");
    result.innerHTML = html;
}

let ipfsNode = null;
async function getIpfsNode() {
    if (ipfsNode !== null) {
        return ipfsNode;
    }
    ipfsNode = await ipfsCore.create();
    return ipfsNode;
}
