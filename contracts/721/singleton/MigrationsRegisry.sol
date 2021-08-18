// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <=0.8.0;

import "../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Counters.sol";

contract MigrationRegistry is Ownable {


    using Counters for Counters.Counter;


    Counters.Counter global_migration_count;
    string version;

   // function setCompleted()


}