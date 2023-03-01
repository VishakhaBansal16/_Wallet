//SPDX-License-Identifier:MIT
pragma solidity ^0.8.14;

interface IERC20{ 
function totalSupply() external view returns(uint256);
    function balanceOf(address account) external view returns(uint256);
    function transfer(address recipient, uint256 amount) external returns(bool);
    function transferFrom(address from, address to, uint256 amount) external returns(bool);
    event    Transfer(address indexed from, address indexed to, uint256 value);
}

contract ERC20 is IERC20{
    string public name;
    string public symbol;
    uint8 public decimals;
    event Approval(address indexed tokenOwner,address indexed spender, uint tokens);
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;
    uint256 _totalSupply;
    address admin;
    constructor(string memory _name, string memory _symbol, uint8 _decimal, uint256 _tSupply){
        _totalSupply = _tSupply;
        balances[msg.sender] = _totalSupply;
        name = _name;
        symbol = _symbol;
        decimals = _decimal;
        admin = msg.sender;
    }

    function totalSupply() public override view returns(uint256){
        return _totalSupply;
    }

    function balanceOf(address tokenOwner) public override view returns(uint256){
        return balances[tokenOwner];
    }

    function transfer(address reciever, uint256 numTokens) public override returns(bool){
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender]-= numTokens;
        balances[reciever]+=numTokens;
        emit Transfer(msg.sender, reciever, numTokens);
        return true;
    }

    modifier onlyAdmin{
        require(msg.sender == admin, "Only admin can run this function");
        _;
    }

    function mint(uint256 _qty) public onlyAdmin returns(uint256){
        _totalSupply+=_qty;
        balances[msg.sender]+=_qty;
        return _totalSupply;
    }

    function burn(uint256 _qty) public onlyAdmin returns(uint256){
        require(balances[msg.sender] >= _qty);
        _totalSupply -= _qty;
        balances[msg.sender]-= _qty;
        return _totalSupply;
    }

    function allowance(address _owner, address _spender) public view returns(uint256 remaining){
        return allowed[_owner][_spender];
    }

    function approve(address _spender, uint256 _value) public returns(bool success){
        allowed[msg.sender][_spender]=_value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        uint256 allowance1= allowed[_from][msg.sender];
        require(balances[_from] >= _value && allowance1 >= _value);
        balances[_to]+=_value;
        balances[_from]-=_value;
        allowed[_from][msg.sender]-=_value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}
