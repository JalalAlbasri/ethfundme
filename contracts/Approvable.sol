pragma solidity ^0.4.24;

import "./EmergencyStoppable.sol";

/**
  @title Approvable
  @dev Abstract Contract
  
  Provides the ability for a Contracts Approval State to be managed by a group of Administrators
  via a Commit/Reveal Voting Pattern.

  keccak256 encrypted vote options + salts are comitted during the commit phase as vote secrets.
  vote secrets are revealed during the reveal phase and the votes are tallied.

  Tally will stop early if enough votes to come to a decision are found.
  A strict majority is not require (if there are an even number of voters 50% is enough)
  (See modifier endReveal() for details)

  Requires a contract that implements the Administrated Interface to be supplied in the contructor
  to restrict access to only authorized voters.
  
  Contracts that extend this contract must implement the onApproval(); and onRejection(); abstract functions.

  Extends the EmergencyStoppable Contract allowing it to suspend voting during Stopped State.
  
 */

contract Approvable is EmergencyStoppable {
  /**
    Events
  */

  /**
    @dev Event emitted when a Vote is Committed
    The payload is address of the vote committer
   */
  event voteCommitted (address indexed voteCommiter);
  
  /**
    @dev Event emitted when a Vote is Reveal
    The payload is address of the vote revealer
   */
  event voteRevealed (address indexed voteRevealer);
  
  /**
    @dev Event emitted when all votes have been Comitted
   */  
  event allVotesComitted();
  
  /**
    @dev Event emitted when enough votes have been revealed to
    conclude arrive at a decision on the vote.
    payload is the outcome of the vote.
   */
  event votePassed (bool isApproved);
  
  /**
    STATE VARIABLES
   */

  // DATA STRUCTURES

  /**
    @dev State Management Pattern
    The states of the Commit/Reveal Voting process
   */
  enum ApprovalStates {
    Commit,
    Reveal,
    Approved,
    Rejected,
    Cancelled
  }
  
  
  // Stores the committed voteSecrets
  // stored in a mappign to make retrieval by account easy
  mapping(address => bytes32) public voteSecrets;
  
  // Keeps track of what accnounts have voted
  mapping(address => bool) public hasVoted;
  // keeps track of what accounts have revealed
  mapping(address => bool) public hasRevealed;

  // Tracks the number of Votes committed and revealed.
  // Required becuase secrets are stored in a mapping
  uint public numVoteSecrets;
  uint public numVoteReveals;

  // Initial Approval State
  ApprovalStates public approvalState = ApprovalStates.Commit;
  
  // Tallies the number of approvals and rejections
  uint public numApprovals;
  uint public numRejections;

  /**
    @dev constructor
  */
  constructor () public
  {
  }

  /**
    MODIFIERS
   */

  // ACCESS RESTRICTION
  /**
    @dev modifier to restrict access to only admins
   */
  modifier onlyAuthorized() {
    require(isAuthorized(), "Only authorized");
    _;
  }

  /**
    @dev modifier to restrict access to only accounts that have voted
   */
  modifier onlyVoted() {
    require(hasVoted[msg.sender] == true, "Account has not voted");
    _;
  }

  /**
    @dev modifier to restrict access to only accounts that have not revealed yet
   */
  modifier onlyNotRevealed() {
    require(hasRevealed[msg.sender] == false, "Account has already revealed");
    _;
  }

  // STATE MANAGEMENT
  /**
    @dev modifier to restrict function execution based on approval state
   */
  modifier onlyDuringApprovalState(ApprovalStates _approvalState) {
    require(approvalState == _approvalState, "Invalid approval state");
    _;
  }

  /**
    @dev transition state from commit to reveal
   */
  modifier endCommit() {
    _;
    if (numVoteSecrets == numVoters()) { //requires that all admins have voted
      approvalState = ApprovalStates.Reveal;
      emit allVotesComitted();
    }
  }

  // Doesn't require all votes to be revealed only enough.
  modifier endReveal() {
    _;
    // number of reveals required to pass the vote
    uint numAdmins = numVoters();
    uint required = numAdmins / 2 + numAdmins % 2;

    if (numApprovals >= required) {
      approvalState = ApprovalStates.Approved;
      onApproval();
      emit votePassed(true);
    }
    if (numRejections >= required) {
      approvalState = ApprovalStates.Rejected;
      onRejection();
      emit votePassed(false);
    }
  }

  /**
    INTERFACE
   */

  // ABSTRACT FUNCTIONS
  /**
    @dev called on approval. Must be implemented by Contracts that extend this
   */
  function onApproval() internal;
  /**
    @dev called on rejecting. Must be implemented by Contracts that extend this
   */
  function onRejection() internal;

  /**
    @dev Must be implemented by Contracts that extend this as a way to determine 
    if an account is authorized to place a vote
    Also implements EmergencyStoppable Interface
   */
   function isAuthorized() internal returns(bool);

  /**
    @dev Must be implemented by Contracts that extend this as a way to determine 
    the total number of voters
   */
   function numVoters() internal returns(uint);

  // INTERFACE
  /**
    @dev Allows authroized accounts to place a vote
    @param secretVote keccak256 encrypted voteOption and Salt
    The encrypted voteSecrets are collected during the commit phase
   */
 function vote(bytes32 secretVote) public 
    stoppedInEmergency
    onlyAuthorized
    onlyDuringApprovalState(ApprovalStates.Commit) 
    endCommit {
      voteSecrets[msg.sender] = secretVote;
      if (hasVoted[msg.sender] == false) {
        numVoteSecrets++;
        hasVoted[msg.sender] = true;
        emit voteCommitted(msg.sender);
    }
  }

  /**
    @dev Allows authorized accounts to reveal votes
    @param voteOption a boolean vote option true to approve and false to reject
    @param salt salt used in encryption of vote secret
    // reverts if keccak256 encryption of params does not match previsouly comitted voteSecret
   */
  function reveal(bool voteOption, uint salt) public 
    stoppedInEmergency
    onlyVoted
    onlyNotRevealed
    onlyDuringApprovalState(ApprovalStates.Reveal) 
    endReveal {
      require(keccak256(abi.encodePacked(voteOption, salt)) == voteSecrets[msg.sender], "Vote secrets do not match");

      if (voteOption) {
        numApprovals++;
      } else {
        numRejections++;
      }

      numVoteReveals++;
      hasRevealed[msg.sender] = true;
      emit voteRevealed(msg.sender);
  }

}