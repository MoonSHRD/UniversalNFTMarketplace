// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract BlackMark is ERC20, Ownable {
    
    /**
     * @dev black admins list with current status
     */
    mapping(address => bool) administrators;

    /**
     * @dev emit while create new black admin
     * @param blackAdmin address of new black admin
     * @param status true if admin is black
     */
    event BlackAdminStatusChanged(address blackAdmin, bool status);

    constructor(string memory name_, string memory symbol_)
        ERC20(name_, symbol_)
    {}

    /**
     * @dev allows to call function only being black admin
     * @param blackAdmin_ address which needs to be checked
     */
    modifier blackAdminsOnly(address blackAdmin_) {
        require(
            administrators[blackAdmin_] == true,
            "only black admin can use it"
        );
        _;
    }

    /**
     * @dev add new black admin to list
     * @param blackAdmin_ address of a new black admin
     * @return bool
     */
    function changeBlackAdminStatus(address blackAdmin_) public onlyOwner() returns(bool) {
        bool status = administrators[blackAdmin_];
        if(status){
            administrators[blackAdmin_] = false;
        } else {
            administrators[blackAdmin_] = true;
        }
        bool newStatus = administrators[blackAdmin_];
        emit BlackAdminStatusChanged(blackAdmin_, newStatus);
        return true;
    }

    /**
     * @dev get current status of black admin
     * @param blackAdmin_ address of a new black admin
     * @return bool
     */
    function getBlackAdminStatus(address blackAdmin_) public view onlyOwner() returns(bool) {
        return administrators[blackAdmin_];
    }

    /**
     * @dev mint black mark to address which needs to be banned
     * @param from_ address form black admin's list
     * @param to_ address to be banned
     */
    function mintMark(address from_, address to_) public blackAdminsOnly(from_) {
        uint blackMark = 1 ether;
        super._mint(to_, blackMark);
    }

    /**
     * @dev burn black mark to address which needs to be unbanned
     * @param from_ address form black admin's list
     * @param to_ address to be unbanned
     */
    function burnMark(address from_, address to_) public blackAdminsOnly(from_) {
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
