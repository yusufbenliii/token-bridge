const Web3 = require("web3");
const fs = require("fs");
const privateKey = fs.readFileSync("../.private_key").toString();

const BridgeStation = require("../build/contracts/BridgeStation.json");
const BridgeAbi = BridgeStation.abi;
const AvaxBridgeAddress = BridgeStation.networks["43113"].address;

const TestToken = require("../build/contracts/TestToken.json");
const TokenAbi = TestToken.abi;
const TokenInAvaxAddress = TestToken.networks["43113"].address;
const TokenInBscAddress = TestToken.networks["97"].address;

const AVAXweb3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
const BSCweb3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545/");

async function main() {
  const account = await AVAXweb3.eth.accounts.privateKeyToAccount(privateKey)
    .address;

  const AVAXBridgeContract = new AVAXweb3.eth.Contract(
    BridgeAbi,
    AvaxBridgeAddress
  );
  const TokenInAVAXContract = new AVAXweb3.eth.Contract(
    TokenAbi,
    TokenInAvaxAddress
  );

  const TokenInBSCContract = new BSCweb3.eth.Contract(
    TokenAbi,
    TokenInBscAddress
  );

  // set our token in bsc as bridge token in avax
  var tx = {
    from: account,
    to: AvaxBridgeAddress,
    gas: 300000,
    data: AVAXBridgeContract.methods
      .connectChains(TokenInAvaxAddress, 97, TokenInBscAddress)
      .encodeABI(),
  };
  let signedTx = await AVAXweb3.eth.accounts.signTransaction(tx, privateKey);
  let receipt = await AVAXweb3.eth.sendSignedTransaction(
    signedTx.rawTransaction
  );

  //   Give approve to avax bridge to burn our tokens
  tx = {
    from: account,
    to: TokenInAvaxAddress,
    gas: 300000,
    data: TokenInAVAXContract.methods
      .approve(AvaxBridgeAddress, "1000000000000000000000000")
      .encodeABI(),
  };
  signedTx = await AVAXweb3.eth.accounts.signTransaction(tx, privateKey);
  receipt = await AVAXweb3.eth.sendSignedTransaction(signedTx.rawTransaction);

  // Burn request to avax bridge
  tx = {
    from: account,
    to: AvaxBridgeAddress,
    gas: 300000,
    data: AVAXBridgeContract.methods
      .burnRequest(TokenInAvaxAddress, "1000000000000000000000000", 97)
      .encodeABI(),
  };
  signedTx = await AVAXweb3.eth.accounts.signTransaction(tx, privateKey);
  receipt = await AVAXweb3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log(receipt);
}

main();
