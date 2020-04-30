pragma solidity >=0.4.0 <0.7.0;

import "./JewelToken.sol";

contract JewelTokenICO {	
	uint256 public tokenPrice;
    JewelToken public tokenContract;
    
	constructor (JewelToken _tokenContract, uint256 _tokenPrice) public{
	    tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}

	function buyTokens(address _from, address _to, uint256 _numberOfTokens) public payable {
		require(msg.value == (_numberOfTokens * tokenPrice));
		tokenContract.transferFrom(_from, _to, _numberOfTokens);
	}
    
}