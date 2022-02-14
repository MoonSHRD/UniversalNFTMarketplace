// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract BlackMark is ERC20, Ownable {
    
    /**
     * @dev admins list with current status
     */
    mapping(address => bool) administrators;

    /**
     * @dev emit while create new admin
     * @param admin address of new admin
     * @param status bool
     */
    event AdminStatusChanged(address admin, bool status);

    constructor(string memory name_, string memory symbol_)
        ERC20(name_, symbol_)
    {}

    /**
     * @dev allows to call function only being admin
     */
    modifier adminsOnly() {
        require(
            administrators[msg.sender] == true,
            "only admin can use it"
        );
        _;
    }

    /**
     * @dev add new admin to list
     * @param admin_ address of a new admin
     * @return bool
     */
    function changeAdminStatus(address admin_) public onlyOwner() returns(bool) {
        bool status = administrators[admin_];
        if(status){
            administrators[admin_] = false;
        } else {
            administrators[admin_] = true;
        }
        bool newStatus = administrators[admin_];
        emit AdminStatusChanged(admin_, newStatus);
        return true;
    }

    /**
     * @dev get current status of admin
     * @param admin_ address of a new admin
     * @return bool
     */
    function getAdminStatus(address admin_) public view onlyOwner() returns(bool) {
        return administrators[admin_];
    }

    /**
     * @dev mint black mark to address which needs to be banned
     * @param to_ address to be banned
     */
    function mintMark(address to_) public adminsOnly() {
        uint blackMark = 1 ether;
        super._mint(to_, blackMark);
    }

    /**
     * @dev burn black mark to address which needs to be unbanned
     * @param to_ address to be unbanned
     */
    function burnMark(address to_) public adminsOnly() {
        uint blackMark = 1 ether;
        super._burn(to_, blackMark);
    }

    /**
    * @notice Removing some ERC20 functionality not yet needed
    * @dev the functions below are all revert when called.
    */

    function transfer(address, uint) public virtual override returns (bool) {
        revert("Cannot be transfered");
    }

    function transferFrom(
        address,
        address,
        uint
    ) public virtual override returns (bool) {
        revert("Cannot be transfered");
    }

    function approve(address, uint256) public virtual override returns (bool) {
        revert("Cannot be approved");
    }

    function increaseAllowance(address, uint256)  public virtual override returns (bool) {
        revert("Allowance cannot be increased");
    }

    function decreaseAllowance(address, uint256) public virtual override returns (bool) {
        revert("Allowance cannot be decreased");
    }
}
