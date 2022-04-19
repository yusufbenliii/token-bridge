const BridgeStation = artifacts.require("BridgeStation");
const TestToken = artifacts.require("TestToken");

module.exports = async function (deployer, network, accounts) {
  const admin = accounts[0];
  await deployer.deploy(BridgeStation, admin, { from: admin });
  await deployer.deploy(TestToken, { from: admin });
};

//0xE8dd15e5a11B5c6c1197E94EbF7be1A2DF09b426
//0xDc3172668CC9eaB59AeD201e2A99a0166612002B

//0x46934372Db6dBA16734F82A304097aD9779F2673
//0x961f64A57730f002DabAa78137978fCc441A306D
