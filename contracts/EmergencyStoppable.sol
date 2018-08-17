pragma solidity ^0.4.24;

contract EmergencyStoppable {
  bool public isStopped = false;

  modifier onlyAuthorized() {
    require(isAuthorized(), "only authorized to stop allowed");
    _;
  }

  modifier stoppedInEmergency {
      require(!isStopped, "Contract must not be stopped");
      _;
  }

  modifier onlyInEmergency {
      require(isStopped, "Contract must be stopped");
      _;
  }

  function isAuthorized() internal returns (bool);

  function stopContract() public 
    onlyAuthorized
  {
      isStopped = true;
  }

  function resumeContract() public 
    onlyAuthorized
  {
      isStopped = false;
  }
}
