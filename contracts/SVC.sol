// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";

contract SVC is Ownable {

    using Counters for Counters.Counter;
    Counters.Counter versionCounter;

    string public version;
    uint public versionId;

    //map from version name to version index
    mapping (string => uint) public versionsIndex;
    //map from version index to version name
    string[] public versionsName;
    //map from version index to contract address
    mapping (uint => mapping (string => address)) public versionToContractAddress;

    // Event about registration new migration.
    event NewMigrationHuman(uint id, string name);

    // Event about registration new migration.
    event SetNewContractAddressHuman(string version, string contractName, address contractAddress);

    modifier isEmptyContractName(string memory name_) {
        require(keccak256(abi.encodePacked(name_)) != keccak256(abi.encodePacked("")), "contract name must be filled correctly");
        _;
    }

    constructor (string memory version) {
        versionsIndex[version] = versionId;
        versionsName.push(version);
    }

    // Create new migration
    function NewMigration(string memory versionName_) public onlyOwner() returns (uint){
        require(keccak256(abi.encodePacked(versionName_)) != keccak256(abi.encodePacked("")), "version name must be filled correctly");
        require(keccak256(abi.encodePacked(versionName_)) != keccak256(abi.encodePacked(versionsName[versionCounter.current()])), "version name must be unique");
        versionCounter.increment();
        version = versionName_;
        versionId = versionCounter.current();
        versionsIndex[version] = versionId;
        versionsName.push(version);
        emit NewMigrationHuman(versionId, version);
        return versionsIndex[version];
    }

    // Get version name by version index
    function GetVersionNameByID(uint versionId_) view public onlyOwner() returns (string memory) {
        return versionsName[versionId_];
    }

    function GetContractAddress(uint version_index, string memory contract_name) view public onlyOwner() isEmptyContractName(contract_name) returns (address) {
        return versionToContractAddress[version_index][contract_name];
    }

    function GetCurrentVersionContractAddress(string memory contract_name) view public onlyOwner() isEmptyContractName(contract_name) returns (address) {
        return versionToContractAddress[versionId-1][contract_name];
    }

    // Set new contract info to current version index
    function SetNewContractAddress(string memory version_, string memory contract_name, address contractAddress_) public onlyOwner() isEmptyContractName(contract_name) {
        require(contractAddress_ != address(0), 'must NOT be zero address');
        require(keccak256(abi.encodePacked(version_)) != keccak256(abi.encodePacked("")), "version name must be filled correctly");
        uint currentVersion = versionId;
        require(versionToContractAddress[currentVersion][contract_name] == address(0), "re-write must be denied");
        versionToContractAddress[currentVersion][contract_name] = contractAddress_;
        emit SetNewContractAddressHuman(version_, contract_name, contractAddress_);
    }

}