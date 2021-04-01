import StellarSdk from 'stellar-sdk';
import arrayBufferToHex from 'array-buffer-to-hex';
import * as ipfsCore from 'ipfs-core';
import * as wallet from './rabet.js';
import * as config from './config.js';

const version = `${process.env.VERSION || "dev"}`;
console.log(`Version: ${version}`);

function getConfig() {
    const network = document.getElementById("network").value;
    return config.getConfig(network);
}

window.init = wrapErrorHandling(init);
window.add = wrapErrorHandling(add);
window.create = wrapErrorHandling(create);
window.view = wrapErrorHandling(view);
window.upload = wrapErrorHandling(upload);

function wrapErrorHandling(f) {
    return async () => {
        try {
            await f();
        } catch (error) {
            resultError(error.error || error);
            document.getElementById("create-button").removeAttribute("disabled");
            document.getElementById("view-button").removeAttribute("disabled");
            throw error;
        }
    };
}

function resultReset() {
    const result = document.getElementById("result");
    result.innerText = "";
    result.classList.add("d-none");
}

function resultError(error) {
    const result = document.getElementById("result");
    result.innerText = error.toString();
    result.classList.remove("d-none");
    result.classList.remove("alert-success");
    result.classList.add("alert-danger");
}

function resultSuccess(html) {
    const result = document.getElementById("result");
    result.innerHTML = html;
    result.classList.remove("d-none");
    result.classList.remove("alert-danger");
    result.classList.add("alert-success");
}

async function init() {
    const walletButton = document.getElementById("wallet-button");
    if (wallet.isConnected()) {
        walletButton.classList.add("d-none");
        document.getElementById("create-button").classList.add("d-block");
        document.getElementById("view-button").classList.add("d-block");
    } else {
        walletButton.innerText = "Add the Rabet extension to Chrome";
        window.setTimeout(init, 500);
    }
}

async function add() {
    init();
    if (!wallet.isConnected()) {
        window.open("https://rabet.io", "_blank", "noopener");
    }
}

async function create() {
    resultReset();
    document.getElementById("create-button").setAttribute("disabled", "disabled");
    document.getElementById("view-button").setAttribute("disabled", "disabled");

    const { code, issuer, xdr } = await build();
    const signedXdr = await wallet.signTransaction(xdr, getConfig().network);
    console.log(`Transaction signed: ${signedXdr}`);
    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(signedXdr, getConfig().networkPassphrase);
    const result = await getConfig().horizonServer.submitTransaction(signedTransaction);
    console.log(result);
    resultSuccess(`🎉 View your NFT <a href="${getConfig().viewUrl(code, issuer)}">here</a>.`);

    document.getElementById("create-button").removeAttribute("disabled");
    document.getElementById("view-button").removeAttribute("disabled");
}

async function view() {
    resultReset();
    document.getElementById("create-button").setAttribute("disabled", "disabled");
    document.getElementById("view-button").setAttribute("disabled", "disabled");

    const { xdr } = await build();
    const url = `https://laboratory.stellar.org/#xdr-viewer?type=TransactionEnvelope&input=${encodeURIComponent(xdr)}`;
    window.open(url, "_blank", "noopener");

    document.getElementById("create-button").removeAttribute("disabled");
    document.getElementById("view-button").removeAttribute("disabled");
}

let ipfsNode = null;
async function getIpfsNode() {
    if (ipfsNode !== null) {
        return ipfsNode;
    }
    ipfsNode = await ipfsCore.create();
    return ipfsNode;
}

async function build() {
    const code = document.getElementById("code").value;
    const fileUpload = document.getElementById("file-upload");
    const description = document.getElementById("description").value;

    let nftAssetUrlParts = [];
    let nftAssetHash = null;
    if (fileUpload.files.length > 0) {
        const file = fileUpload.files[0];
        const buffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
        const ipfsNode = await getIpfsNode();
        const { cid } = await ipfsNode.add(buffer)
        const url = `ipfs://${cid.string}`;
        nftAssetUrlParts = url.match(/.{1,64}/g);
        nftAssetHash = await crypto.subtle.digest("SHA-256", buffer);
    }

    let nftMetaUrlParts = null;
    let nftMetaHash = null;
    if (description.length > 0) {
        const meta = {
            "description": description,
        }
        const metaJson = JSON.stringify(meta, null, "\t");
        const metaEncoder = new TextEncoder();
        const metaData = metaEncoder.encode(metaJson);
        const ipfsNode = await getIpfsNode();
        const { cid } = await ipfsNode.add(metaData)
        const url = `ipfs://${cid.string}`;
        nftMetaUrlParts = url.match(/.{1,64}/g);
        nftMetaHash = await crypto.subtle.digest("SHA-256", metaData);
    }

    const issuerKey = StellarSdk.Keypair.random();
    const asset = new StellarSdk.Asset(code, issuerKey.publicKey());

    const accountPublicKey = await wallet.getPublicKey();
    const account = await (async () => {
        try {
            return await getConfig().horizonServer.loadAccount(accountPublicKey);
        } catch {
            throw new Error(`Your account ${accountPublicKey} does not exist on the Stellar ${getConfig().network} network. It must be created before it can be used to submit transactions.`);
        }
    })();
    const fee = await getConfig().horizonServer.fetchBaseFee();

    const transaction = new StellarSdk.TransactionBuilder(account, { fee, networkPassphrase: getConfig().networkPassphrase });
    transaction.setTimeout(300);
    transaction.addMemo(StellarSdk.Memo.text('Create NFT'));
    transaction.addOperation(StellarSdk.Operation.beginSponsoringFutureReserves({ sponsoredId: issuerKey.publicKey() }));
    transaction.addOperation(StellarSdk.Operation.createAccount({ destination: issuerKey.publicKey(), startingBalance: "0" }));
    for (let i = 0; i < nftAssetUrlParts.length; i++) {
        transaction.addOperation(StellarSdk.Operation.manageData({
            source: issuerKey.publicKey(),
            name: `nft.asset.url[${i}]`,
            value: nftAssetUrlParts[i],
        }));
    }
    if (nftAssetHash) {
        transaction.addOperation(StellarSdk.Operation.manageData({
            source: issuerKey.publicKey(),
            name: `nft.asset.sha256`,
            value: arrayBufferToHex(nftAssetHash),
        }));
    }
    for (let i = 0; i < nftMetaUrlParts.length; i++) {
        transaction.addOperation(StellarSdk.Operation.manageData({
            source: issuerKey.publicKey(),
            name: `nft.meta.url[${i}]`,
            value: nftMetaUrlParts[i],
        }));
    }
    if (nftMetaHash) {
        transaction.addOperation(StellarSdk.Operation.manageData({
            source: issuerKey.publicKey(),
            name: `nft.meta.sha256`,
            value: arrayBufferToHex(nftMetaHash),
        }));
    }
    transaction.addOperation(StellarSdk.Operation.endSponsoringFutureReserves({ source: issuerKey.publicKey() }))
    transaction.addOperation(StellarSdk.Operation.changeTrust({ asset: asset, limit: "1.0" }));
    transaction.addOperation(StellarSdk.Operation.payment({ source: issuerKey.publicKey(), destination: accountPublicKey, asset: asset, amount: "1.0" }));
    transaction.addOperation(StellarSdk.Operation.setOptions({ source: issuerKey.publicKey(), setFlags: StellarSdk.AuthImmutableFlag, masterWeight: 0, lowThreshold: 0, medThreshold: 0, highThreshold: 0 }));

    const transactionBuilt = transaction.build();
    transactionBuilt.sign(issuerKey);
    const xdr = transactionBuilt.toEnvelope().toXDR('base64');
    console.log(`Transaction built: ${xdr}`);

    return { code, issuer: issuerKey.publicKey(), xdr };
}

async function upload() {
    const fileUpload = document.getElementById("file-upload");

    const fileLabel = document.getElementById("file-label");
    fileLabel.innerText = "";

    const filePreviewGroup = document.getElementById("file-preview-group");
    const filePreview = document.getElementById("file-preview");
    while (filePreview.firstChild) {
        filePreview.removeChild(filePreview.firstChild);
    }
    if (fileUpload.files.length > 0) {
        const file = fileUpload.files[0];
        const filename = fileUpload.value.replace("C:\\fakepath\\", "");
        const sizeKB = file.size / 1024;
        fileLabel.innerText = `${filename} (${sizeKB} KB)`;

        const fileUrl = window.URL.createObjectURL(file);
        const preview = document.createElement("img");
        preview.src = fileUrl;
        filePreview.appendChild(preview);
        filePreviewGroup.classList.remove("d-none");
    } else {
        filePreviewGroup.classList.add("d-none");
    }
}
