import Web3 from 'web3';
import {ABI} from './ABI.js';
const address = '0x7Ce95E1fE24b6813Fa9cd0952d3cAFA249Dd563f';
const privateKey = '0x8306c2c686eb63fd5dd126c62ffd4eb09819d1020681653e1eb9f16387bca3d2';
const infuraUrl = 'https://mainnet.infura.io/v3/73278735c19b4cd7bc5ea172332ca2f9';
const init = async() => {
    const web3 = new Web3(infuraUrl);
    //const networkId = await web3.eth.net.getId();
    const myContract = new web3.eth.Contract(
        ABI, 
        "0x1ff1EA0a7F55BD4bBAf2a3C35EEbE63D921FcbEc"
    );
    //const tx = myContract.methods.transfer('0xB42Eeaef576125eE82046f2FdAafad1e1C301cff', 50).send();
    const tx = myContract.methods.mint(100);
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
            //chainId: networkId
        },
        privateKey
    );
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Transaction hash: ${receipt.transactionHash}`);
}
init();


