pragma solidity ^0.4.24;

contract EmergencyStoppable {
  bool public isStopped = false;

    modifier stoppedInEmergency {
        require(!isStopped);
        _;
    }

    modifier onlyInEmergency {
        require(isStopped);
        _;
    }

    modifier onlyAuthorized {
      require(isAuthorized());
      _;
    }

    function isAuthorized() internal returns (bool);

    function stopContract() public onlyAuthorized {
        isStopped = true;
    }

    function resumeContract() public onlyAuthorized {
        isStopped = false;
    }
}
