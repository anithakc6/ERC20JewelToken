pragma solidity >=0.4.0 <0.7.0;

import "./IERC20.sol";

contract JewelToken is IERC20 {	
	uint256 public _totalSupply;
	string public name = "Jewel Token";
	string public symbol = "JT";
	uint8 constant public decimals = 18;
	//1 ether = 100 Jewel
	uint constant public RATE = 100;
	uint constant public _initialSupply = 7500 * RATE;
	address _sellerAddress;
	event Transfer( address indexed _from,
					address indexed _to,
					uint value);

	event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
	mapping(address => uint256) public _balanceOf;
    mapping(address => mapping(address => uint256)) public allowed;

	constructor () public{
		_balanceOf[msg.sender] = _initialSupply;
		_totalSupply = _initialSupply;
		_sellerAddress = msg.sender;
	}

	function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_balanceOf[msg.sender] >= _value);

        _balanceOf[msg.sender] -= _value;
        _balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_balanceOf[_from] >= _value);
        require(allowed[_from][_to] >= _value);

		_balanceOf[_from] -= _value;
        _balanceOf[_to] += _value;

        allowed[_from][_to] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }
	
	function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
		return allowed[_owner][_spender];
	}
	
	function totalSupply() view public returns (uint256) {
		return _totalSupply;
	}
	function balanceOf(address _owner) public view returns (uint256 balance) {
		return _balanceOf[_owner];
	}
	
	function getSellerAddress() public view returns (address){
		return _sellerAddress;
	}
}