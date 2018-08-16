pragma solidity ^0.4.24;

import "./Administrated.sol";
import "./EmergencyStoppable.sol";

contract Approvable is Administrated, EmergencyStoppable {

  /**
    IMPLEMENT EmergencyStoppable INTERFACE
    
   */
  function isAuthorized() internal 
    onlyAdmin
    returns(bool) 
  {
    return true;
  }

  /**
    DATA STRUCTURES
   */

  enum ApprovalStates {
    Commit,
    Reveal,
    Approved,
    Rejected,
    Cancelled
  }

  ApprovalStates public approvalState = ApprovalStates.Commit;

  /**
    STATE VARIABLES
   */

  uint public numApprovals;
  uint public numRejections;

  uint public numVoteSecrets;
  uint public numVoteReveals;

  mapping(address => bytes32) public voteSecrets;
  mapping(address => bool) public hasVoted;
  mapping(address => bool) public hasRevealed;

  /**
    CONSTRUCTOR
   */

  constructor() public {
    
  }

  /**
    ABSTRACT FUNCTIONS
   */

  function onApproval() internal;
  function onRejection() internal;

  /**
    MODIFIERS
   */

  // ACCESS RESTRICTION

  modifier onlyVotedAdmin() {
    require(hasVoted[msg.sender] == true);
    _;
  }

  modifier onlyNotRevealedAdmin() {
    require(hasRevealed[msg.sender] == false);
    _;
  }

  // STATE MANAGEMENT

  modifier onlyDuringApprovalState(ApprovalStates _approvalState) {
    require(approvalState == _approvalState);
    _;
  }

  modifier endCommit() {
    _;
    if (numVoteSecrets == 3) {
      approvalState = ApprovalStates.Reveal;
    }
  }

  // Doesn't require all votes to be revealed only enough.
  modifier endReveal() {
    _;
    if (numApprovals >= 2) {
      approvalState = ApprovalStates.Approved;
      onApproval();
    } 
    if (numRejections >= 2) {
      approvalState = ApprovalStates.Rejected;
      onRejection();
    }
  }

  /**
    INTERFACE
   */

  function vote(bytes32 secretVote) public 
    stoppedInEmergency
    onlyAdmin 
    onlyDuringApprovalState(ApprovalStates.Commit) 
    endCommit {
      voteSecrets[msg.sender] = secretVote;
      if (hasVoted[msg.sender] == false) {
        numVoteSecrets++;
        hasVoted[msg.sender] = true;
    }
  }

  function reveal(bool voteOption, uint salt) public 
    stoppedInEmergency
    onlyVotedAdmin 
    onlyNotRevealedAdmin
    onlyDuringApprovalState(ApprovalStates.Reveal) 
    endReveal {
      require(keccak256(abi.encodePacked(voteOption, salt)) == voteSecrets[msg.sender]);

      if (voteOption) {
        numApprovals++;
      } else {
        numRejections++;
      }

      numVoteReveals++;
      hasRevealed[msg.sender] = true;
  }
}
