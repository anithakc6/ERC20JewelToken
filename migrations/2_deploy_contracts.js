var JewelToken = artifacts.require("./JewelToken.sol");
var JewelTokenICO = artifacts.require("./JewelTokenICO.sol");

module.exports = function(deployer) {
  deployer.deploy(JewelToken).then(function() {
    // JewelToken price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(JewelTokenICO, JewelToken.address, tokenPrice);
  });
};