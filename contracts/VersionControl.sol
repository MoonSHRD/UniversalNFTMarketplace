// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";

contract VersionControl is Ownable {

    using Counters for Counters.Counter;
    Counters.Counter versionCounter;

    string public version;
    uint public versionId;

    //map from version name to version index
    mapping (string => uint) public versionsIndex;
    //map from version index to version name
    mapping (uint => string) public versionsName;
    //map from contract name to contract address
    mapping (string => address) public contractAddressFromName;
    // map from contract address to contract name
    mapping (address => string) public contractNameFromAddress;
    // map from version name to contract name
    mapping (string => string) public versionFromContractName;
    //map from version index to contract address
    mapping (uint => mapping (string => address)) public versionToContractAddress;

    // Event about registration new migration.
    event NewMigrationHuman(uint id, string name);

    // Event about registration new migration.
    event SetNewContractAddressHuman(string version, string contractName, address contractAddress);

    // Create new migration
    function NewMigration(string memory _versionName) public onlyOwner() returns (uint){
        require(keccak256(abi.encodePacked(_versionName)) != keccak256(abi.encodePacked("")), "version name must be filled correctly");
        require(keccak256(abi.encodePacked(_versionName)) != keccak256(abi.encodePacked(versionsName[versionCounter.current()])), "version name must be unique");
        version = _versionName;
        versionCounter.increment();
        versionId = versionCounter.current();
        versionsIndex[version] = versionId;
        versionsName[versionId] = version;
        emit NewMigrationHuman(versionId, version);
        return versionsIndex[version];
    }

    // Get version name by version index
    function VersionNameByID(uint _versionId) view public onlyOwner() returns (string memory) {
        require(_versionId > 0, "must be greater than zero");
        return versionsName[_versionId];
    }

    // Set new contract info to current version index
    function SetNewContractAddress(string memory _version, string memory _contractName, address _contractAddress) public onlyOwner() {
        require(_contractAddress != address(0), 'must NOT be zero address');
        require(keccak256(abi.encodePacked(_contractName)) != keccak256(abi.encodePacked("")), "contract name must be filled correctly");
        require(keccak256(abi.encodePacked(_version)) != keccak256(abi.encodePacked("")), "version name must be filled correctly");
        contractAddressFromName[_contractName] = _contractAddress;
        contractNameFromAddress[_contractAddress] = _contractName;
        versionFromContractName[_contractName] = _version;
        uint currentVersion = versionCounter.current();
        require(currentVersion > 0, "must be greater than zero");
        versionToContractAddress[currentVersion][_contractName] = _contractAddress;
        emit SetNewContractAddressHuman(_version, _contractName, _contractAddress);
    }

    // Get contract name by address
    function ContractNameFromAddress(address _contractAddress) view public onlyOwner() returns (string memory) {
        require(_contractAddress != address(0), 'must NOT be zero address');
        return contractNameFromAddress[_contractAddress];
    }

    // Get version by contract name
    function VersionFromContractName(string memory _contractName) view public onlyOwner() returns (string memory) {
        require(keccak256(abi.encodePacked(_contractName)) != keccak256(abi.encodePacked("")), "contract name must be filled correctly");
        return versionFromContractName[_contractName];
    }

}