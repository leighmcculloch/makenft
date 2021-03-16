import StellarSdk from 'stellar-sdk';
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

    document.getElementById("code").innerText = code;

    const account = await config.getConfig(network).horizonServer.loadAccount(issuer);
    let data = "";
    for (let i = 0; ; i++) {
        const value = account.data_attr[`data[${i}]`];
        if (typeof value === "undefined") {
            break;
        }
        data += atob(value);
    }

    const preview = document.createElement("img");
    preview.src = data;
    const filePreview = document.getElementById("file-preview");
    filePreview.appendChild(preview);
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
    result.classList.remove("d-none");
    result.classList.add("alert-danger");
}
