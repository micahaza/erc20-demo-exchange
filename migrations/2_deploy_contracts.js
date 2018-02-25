var erc20exchange = artifacts.require("./ERC20Exchange.sol");
var fsToken = artifacts.require("./FixedSupplyToken.sol");

module.exports = function(deployer) {
    deployer.deploy(erc20exchange);
    deployer.deploy(fsToken);
}