import Web3 from 'web3';
import {ABI} from './ABI.js';

const infuraUrl = 'https://goerli.infura.io/v3/73278735c19b4cd7bc5ea172332ca2f9';
export const init = async(address, privateKey, receiver, amount) => {
    const web3 = new Web3(infuraUrl);
    const myContract = new web3.eth.Contract(
        ABI, 
        "0x1ff1EA0a7F55BD4bBAf2a3C35EEbE63D921FcbEc"
    );
    const tx = myContract.methods.transfer(receiver, amount);
    const gas = await tx.estimateGas({from: address});
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(address);
    const signedTx = await web3.eth.accounts.signTransaction(
        {
            to: myContract.options.address,
            data,
            gas,
            gasPrice,
            nonce
        },
        privateKey
    );
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    return receipt;
}



