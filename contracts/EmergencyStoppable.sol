pragma solidity ^0.4.24;

// import "./Administrated.sol";

// contract EmergencyStoppable is Administrated {
contract EmergencyStoppable {
  bool public isStopped = false;

  modifier onlyAuthorized() {
    require(isAuthorized());
    _;
  }

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
