const Web3 = require("web3");
const fs = require("fs");
const privateKey = fs.readFileSync("../.private_key").toString();

const BridgeStation = require("../build/contracts/BridgeStation.json");
const BridgeAbi = BridgeStation.abi;
const AvaxBridgeAddress = BridgeStation.networks["43113"].address;
const BSCBridgeAddress = BridgeStation.networks["97"].address;

const TestToken = require("../build/contracts/TestToken.json");
const TestTokenAbi = TestToken.abi;
const TokenInAvaxAddress = TestToken.networks["43113"].address;
const TokenInBscAddress = TestToken.networks["97"].address;

const AVAXweb3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
const AVAXweb3ws = new Web3("wss://api.avax-test.network/ext/bc/C/ws");
const BSCweb3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545/");

function getObjectFromStruct(bridgeStruct) {
  var obj = [
    bridgeStruct[0],
    bridgeStruct[1],
    bridgeStruct[2],
    bridgeStruct[3],
    bridgeStruct[4],
    bridgeStruct[5],
    bridgeStruct[6],
    bridgeStruct[7],
  ];
  return obj;
}

async function main() {
  const account = await AVAXweb3.eth.accounts.privateKeyToAccount(privateKey)
    .address;
  const AVAXBridgeStationSocket = new AVAXweb3ws.eth.Contract(
    BridgeAbi,
    AvaxBridgeAddress
  );

  const BSCBridgeContract = new BSCweb3.eth.Contract(
    BridgeAbi,
    BSCBridgeAddress
  );

  const BSCToken = new BSCweb3.eth.Contract(TestTokenAbi, TokenInBscAddress);
  console.log("Listening events");

  var bridgeRequest;
  AVAXBridgeStationSocket.events.BridgeEvent({}, async (err, events) => {
    if (err) console.log(err);
    bridgeRequest = getObjectFromStruct(events.returnValues.bridgeStruct);
    var tx = {
      from: account,
      to: BSCBridgeAddress,
      gas: 300000,
      data: BSCBridgeContract.methods.mintRequest(bridgeRequest).encodeABI(),
    };
    let signedTx = await BSCweb3.eth.accounts.signTransaction(tx, privateKey);
    let receipt = await BSCweb3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    console.log(receipt);
  });
}

main();
