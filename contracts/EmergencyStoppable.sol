pragma solidity ^0.4.24;

/**
  @title EmergencyStoppable
  @dev Abstract Contract
  @dev implementation of the Circuit Breaker/ Emergency Stop design pattern
  
  Allows authorized accounts to put the contract in a 'stopped' state and
  provides modifiers to control function execution according to stopped state

  Decided against using the Pausable Libvrary from the Open-Zeppelin
  because it relies on the Ownable library, which require a single 'Owner' who will be 
  authorized to Stop/Resume the Contract, however we require multiple admins to have the 
  authority to manage the Stopped state (admins)

  This is an adaptation of the Pausable Library with and additoinal abstract function isAuthorized() 
  that child contracts must implement to be able to define who is authorized to manage stopped state 
  making it much more versatile.

  (https://github.com/OpenZeppelin/openzeppelin-solidity/blob/v1.10.0/contracts/lifecycle/Pausable.sol)
  (https://github.com/OpenZeppelin/openzeppelin-solidity/blob/v1.10.0/contracts/ownership/Ownable.sol)
 */

contract EmergencyStoppable {
  
  // TODO: Events

  // STATE VARIABLES
  bool public isStopped = false;

  /**
    @dev modifier to restrict access to only authorized accounts
   */
  modifier onlyAuthorized() {
    require(isAuthorized(), "only authorized to stop allowed");
    _;
  }

  /**
    @dev modifier to disallow function execution during stopped state 
   */
  modifier stoppedInEmergency {
      require(!isStopped, "function is stopped in emergency");
      _;
  }

  /**
    @dev modifier to allow function execution only during stopped state
   */
  modifier onlyInEmergency {
      require(isStopped, "function only available in emergency");
      _;
  }

  /**
    Abstract function.
    @dev Must be implemented by subclasses to provide a way to determine if accounts
    Are authorized to start/stop the Contract
   */
  function isAuthorized() internal returns (bool);

  /**
    @dev Puts the Contract in Stopped state
  */
  function stopContract() public 
    onlyAuthorized
  {
      isStopped = true;
  }

  /**
    @dev Puts the contract not Stopped State
   */
  function resumeContract() public 
    onlyAuthorized
  {
      isStopped = false;
  }
}
