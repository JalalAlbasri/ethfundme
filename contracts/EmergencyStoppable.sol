pragma solidity ^0.4.24;

import "./Administrated.sol";

contract EmergencyStoppable is Administrated {
  bool public isStopped = false;

    modifier stoppedInEmergency {
        require(!isStopped);
        _;
    }

    modifier onlyInEmergency {
        require(isStopped);
        _;
    }

    function isAuthorized() internal returns (bool);

    function stopContract() public 
      onlyAdmin
    {
        isStopped = true;
    }

    function resumeContract() public 
      onlyAdmin 
    {
        isStopped = false;
    }
}
