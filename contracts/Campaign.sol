pragma solidity ^0.4.24;

import "./EthFundMe.sol";
import "./EmergencyStoppable.sol";
import "../node_modules/zeppelin-solidity/contracts/ReentrancyGuard.sol";

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
    Implement EmergencyStoppable Interface
   */
  
  /**
    @dev returns true if msg.sender has the admin role
    This funstion is required to be implemented by the EmergencyStoppable Interface.
    It is used to determine if the calling user (msg.sender) has the authority to stop/start
    the contract.
  */
  function isAuthorized() 
    internal 
    returns(bool)
  {
    return administrated.isAdmin(msg.sender);
  }

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


  /**
    Address of the Administrated Contract that will be used to determine 
    admin status of accounts.
   */
  Administrated public administrated;

  // Initial Approval State
  ApprovalStates public approvalState = ApprovalStates.Commit;
  
  // Tallies the number of approvals and rejections
  uint public numApprovals;
  uint public numRejections;

  /**
    @dev constructor
    @param administratedAddress the address of currently deployed adminstrated Contract
    with current admin management information/functionality
  */
  constructor (address administratedAddress) public
  {
    administrated = Administrated(administratedAddress);
  }

  /**
    MODIFIERS
   */

  // ACCESS RESTRICTION
  /**
    @dev modifier to restrict access to only admins
   */
  modifier onlyAdmin() {
    require(administrated.isAdmin(msg.sender), "only admin authorized");
    _;
  }

  /**
    @dev modifier to restrict access to only accounts that have voted
   */
  modifier onlyVotedAdmin() {
    require(hasVoted[msg.sender] == true, "Admin has not voted");
    _;
  }

  /**
    @dev modifier to restrict access to only accounts that have not revealed yet
   */
  modifier onlyNotRevealedAdmin() {
    require(hasRevealed[msg.sender] == false, "Admin has already revealed");
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
    if (numVoteSecrets == administrated.numAdmins()) { //requires that all admins have voted
      approvalState = ApprovalStates.Reveal;
      emit allVotesComitted();
    }
  }

  // Doesn't require all votes to be revealed only enough.
  modifier endReveal() {
    _;
    // number of reveals required to pass the vote
    uint numAdmins = administrated.numAdmins();
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

  // INTERFACE
  /**
    @dev Allows authroized accounts to place a vote
    @param secretVote keccak256 encrypted voteOption and Salt
    The encrypted voteSecrets are collected during the commit phase
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
    onlyVotedAdmin 
    onlyNotRevealedAdmin
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


/**
  @dev The Campaign Contract

  Manages and holds data for a Crowd Funding Campaign
  Produced by the CampaignFactory
  extends Approvable Contract allowing an Approval State to be managed.
  extends ReentrancyGaurd OpenZeppelin Library gaurding it against reentrancy attacks
  (https://github.com/OpenZeppelin/openzeppelin-solidity/blob/v1.10.0/contracts/ReentrancyGuard.sol)
  

  The Campaign Contract start in a Pending state and must be approved by admins to become active.
  
  Campaigns have a fixed duration. At the end of the Campaign if contributed funds are greater or
  equal to the goal the Campaign Manager will be allowed to withdraw all the Contract Funds via a 
  Pull Payment/Withdrawl pattern.

  It funding fails to meet the goal Contributors will be allowed to retrieve their contributed funds,
  again utilizing Pull Payment/Withdrawl pattern.

  At any point the Campaign can be cancelled by the Campaign Manager, in which case contributors will 
  be allowed to withdraw contributed funds.

  The Campaign is EmergencyStoppable and provides an EmergencyWithdraw function that will allow
  Contributors to retrieve their contributed funds in the event of Emergency.
 */
contract Campaign is Approvable, ReentrancyGuard {
  
  /**
    EVENTS
   */
  /**
    @dev Event emitted when the Campaign has been
    Approved and goes Campaign State changes to Active
    payload is the startDate of the campaign
   */   
  event campaignStarted (
    uint startDate
  );

  /**
    @dev Event emitted when the Campaign ends and 
    campaign State cahnges to Successful or Unsuccessful
    payload is the end date of the campaign and a boolean
    denoting the campaign's success or failure
   */     
  event campaignEnded (
    uint endDate,
    bool isSuccessful
  );

  /**
    @dev Event emitted when the Campaign is cancelled by the
    Campaign manager
    payload is the date the campaign was cancelled
   */     
  event campaignCancelled (
    uint cancelledDate
  );

  /**
    @dev Event emitted when a contribution is made to the Camapign
    payload is the address of the contributor and the amount in eth
    contributed
   */     
  event contributionMade (
    address contributor,
    uint amount
  );

  /**
    @dev Event emitted when a withdrawl is made from the Campaign
    payload is the address of the beneficiary and the amount withdrawn 
    in eth
   */     
  event withdrawlMade (
    address beneficiary,
    uint amount 
  );

  /**
    STATE VARIABLES
   */

  // DATA STRUCTURES

  /**
    Valid Campaign States.
   */
  enum CampaignStates {
    Pending,
    Active,
    Successful,
    Unsuccessful,
    Cancelled
  }

  /**
    Holds the details of a Contribution
    addr The address of a Contributor
    amount The amount contributed in eth
    timestamp The time of the contribution
   */
  struct Contribution {
    address addr;
    uint amount;
    uint timestamp;
  }

  // Initial Campaign State set to Pending
  // This means it is Pending Approval from admins before going active
  CampaignStates public campaignState = CampaignStates.Pending;

  // The current funds in the Campaign
  // Initialized to Contract's balance in case the Contract is 
  // created with eth in the balance
  uint public funds = address(this).balance;
  
  // The Campaign EndDate.
  // Will be set once the Campaign is Approved.
  uint public endDate;

  // Campaign Details
  uint public id;
  string public title;
  uint public goal;
  uint public duration;
  string public description;
  string public image; // url to an associated image
  address public manager;

  // Contributions are sotred in an Array instead of a mapping (address=> Contribution)
  // because we rarely need to retrieve Contributions individually but contributor but
  // more often as a set on Contributions e.g. for a UI
  Contribution[] public contributions;


  // These mappins are used in Withdrawl Functions to restrict access and determine
  // withdrawl amount for each contributor

  // Keep track of the total Contributed for each contributor since a single contributor
  mapping (address => uint) public totalContributed;
  // Keeps track of whether an address has contributed
  mapping (address => bool) public hasContributed;
  // Keeps track of whether an address has withdrawn
  mapping (address => bool) public hasWithdrawn;

  /**
    @dev constructor
    @param _id The Campaign Id, corresponds to the index for the campaign address in the CampaignFactory
    @param _title The title of the Campaign
    @param _goal The funding goal in ether of the campaign
    @param _duration The intended duration of the Active campaign in days
    @param _description A description of the Campaign purposes
    @param _image The url of an image for the campaign
    @param _manager The Campaign Manager
    @param efmAddress Address of Administrated Contract that holds details of admin accounts 
   */

  constructor(
    uint _id, 
    string _title, 
    uint _goal,  
    uint _duration, 
    string _description,
    string _image,
    address _manager,
    address efmAddress
  ) Approvable(efmAddress) public {
    id = _id;
    title = _title;
    goal = _goal;
    duration = _duration * 1 days;
    description = _description;
    image = _image;
    manager = _manager;
  }

  /**
    MODIFIERS
   */

  // ACCESS RESTRICTION
  /**
    @dev modifier restricts access to only the Campaign Manager
   */
  modifier onlyManager() {
    require(msg.sender == manager, "Only campaign manager authorized");
    _;
  }
  
  /**
    @dev modifier restricts access to only not the Campaign Manager
   */
  modifier onlyNotManager() {
    require(msg.sender != manager);
    _;
  }

  /**
    @dev modifier restricts access to only the Campaign Manager of an Admin
   */
  modifier onlyManagerOrAdmin() {
    // FIXME: Is this modifier still used/required? 
    require(msg.sender == manager || administrated.isAdmin(msg.sender), "Only campaign manager or admin authorized");
    _;
  }


  /**
    @dev modifier restricts access to only accounts that have not made a withdrawl
   */
  modifier onlyHasNotWithdrawn() {
    require(hasWithdrawn[msg.sender] == false, "User has already withdrawn");
    _;
  }

  /**
    @dev modifier restricts access to only accounts that have made a contribution
   */
  modifier onlyHasContributed() {
    require(hasContributed[msg.sender] == true, "User has not contributed");
    _;
  }

  // STATE MANAGEMENT
  /**
    @dev modifier restricts access to only during given campaign state
   */
  modifier onlyDuringCampaignState(CampaignStates _campaignState) {
    require(campaignState == _campaignState, "Incorrect campaignState for function");
    _;
  }
  
  /**
    @dev modifier restricts access to only before the campaign has ended
   */
  modifier onlyBeforeCampaignEnd() {
    require(campaignState <= CampaignStates.Active, "Campaign must be active");
    _;
  }
  
  /**
    @dev modifier restricts access to only after the campaign has ended
   */
  modifier onlyAfterCampaignEnd() {
    require(campaignState > CampaignStates.Active, "Campaign must have ended");
    _;
  }

  /**
    @dev modifier transitions the campaign state before function execution
    Will determine the success/failure of the campaign 
   */
  modifier transitionState() {
    if (campaignState == CampaignStates.Active && block.timestamp > endDate
    ) {
      
      if (funds >= goal) {
        campaignState = CampaignStates.Successful;
      } else {
        campaignState = CampaignStates.Unsuccessful;
      }

    }
    _;
  }



  // INPUT VALIDATION
  /**
    @dev modifier validates contributions for interger overflow errors 
   */
  modifier validateContribution() {
    //No Zero Contributions
    require(msg.value > 0, "No zero contributions"); 
     //Integer Overflow Protection
    require(funds + msg.value > funds, "Integer overflow check failed");
    require(totalContributed[msg.sender] + msg.value > totalContributed[msg.sender], "Integer overflow check failed");
    _;
  }

  // PRIVATE FUNCTIONS

  /**
    @dev implements the onApproval function from the Approvable Contract
    Called by Approvable Contract once a Contract is Approved.
    Transitions the Campaign into it's Active state and sets the endDate
    for the Campaign
   */
  function onApproval() internal 
  {
    endDate = block.timestamp + duration;
    campaignState = CampaignStates.Active;
    emit campaignStarted(block.timestamp);
  }

  /**
    @dev Implements the onRejection function from the Approvable Contract
    Called by the Approvable Contract once a Contract is Rejected
    Transitions the Campaign into the Unsuccessful State
   */
  function onRejection() internal
  {
    campaignState = CampaignStates.Unsuccessful;
  }

  /**
    @dev allows the Campaign Manager to withdraw all Contract Funds
    utilizing the Withdrawl Pattern
   */
  function managerWithdrawl() private 
    onlyManager
  {
      hasWithdrawn[msg.sender] = true;
      funds = 0;
      emit withdrawlMade(msg.sender, address(this).balance);
      msg.sender.transfer(address(this).balance);
  }

  /**
    @dev allows a Campaign Contributor to withdraw their contributed
    funds utilizing the Withdrawl Pattern
   */
  function contributorWithdrawl() private 
    onlyHasContributed
  {
    hasWithdrawn[msg.sender] = true;
    funds -= totalContributed[msg.sender];
    emit withdrawlMade(msg.sender, totalContributed[msg.sender]);
    msg.sender.transfer(totalContributed[msg.sender]);
  }

  /**
    INTERFACE
   */
  /**
    @dev Allows a Contribution to be made
    Disallowed during Emergency (Stopped State)
    Restricted to not the Campaign Manager
    Will transition state before executing. Will revert if Campaign has ended.
    No Zero Contributions are allowed
   */
  function contribute() public payable 
    stoppedInEmergency
    onlyNotManager 
    transitionState
    onlyDuringCampaignState(CampaignStates.Active)
    validateContribution 
  {
    hasContributed[msg.sender] = true;
    contributions.push(Contribution(msg.sender, msg.value, now));
    totalContributed[msg.sender] += msg.value;
    funds += msg.value;
    emit contributionMade(msg.sender, msg.value);
  }

  /**
    @dev Allows the Campaign Manager to Cancel the Campaign at any point
    before the Campaign is Over.
    If Contributions have been made Contributors will be allowed to retrieve their funds
    Disallowed during Emergency (Stopped State)
   */    
  function cancelCampaign() public
    stoppedInEmergency
    onlyManager
    transitionState
    onlyBeforeCampaignEnd
  {
    approvalState = ApprovalStates.Cancelled;
    campaignState = CampaignStates.Cancelled;
    emit campaignCancelled(block.timestamp);
  }

  /**
    @dev Allows the Campaign Manager or an Admin to transition Campaign state
    if the end date has been reached.
    Disallowed during Emergency (Stopped State)
   */    
  function endCampaign() public 
    stoppedInEmergency
    onlyManagerOrAdmin
    transitionState
    onlyAfterCampaignEnd
  {
    emit campaignEnded(block.timestamp, (campaignState == CampaignStates.Successful));
  }

  // Wrapper to private function doing the actual work as described in ReentrancyGuard.sol
  function withdraw() external
    stoppedInEmergency
    nonReentrant // modifier from ReentracyGuard OpenZeppelin Library protects against being called again
    onlyHasNotWithdrawn
    transitionState 
    onlyAfterCampaignEnd 
  {
    // If the Campaign was Successful only the Campaign Manager is allowed to withdraw funds
    if (campaignState == CampaignStates.Successful) {
      managerWithdrawl();
    }

    // If the Campaign was Unsuccessful or Cancelled Contributors are allowed to withdraw their
    // contributed funds
    if(campaignState == CampaignStates.Unsuccessful || campaignState == CampaignStates.Cancelled) {
      contributorWithdrawl();
    }
  }

  /**
    @dev Allows Contributors to withdraw their contributed funds if the Campaign is put into an
    Emergency stopped state by an admin
   */
  function emergencyWithdraw() external
    onlyInEmergency
    nonReentrant
    onlyHasNotWithdrawn
  {
    contributorWithdrawl();
  }

  // GETTERS

  /**
    @dev returns the number of contributions (length on contributions array)
   */
  function getNumContributions() public view returns(uint numContributions) {
    return contributions.length;
  }

  /**
    @dev calculates and returns the total contributed funds
    Useful because funds state variable tracks current funds and can change when a 
    withdrawl is made
    Could be replaced by another state variable 'totalContributedFunds' that is incremented
    with funds but not decremented during withdrawls
   */
  function getTotalContributedFunds() public view returns(uint) {
    uint result = 0;
    for (uint i = 0; i < contributions.length; i++) {
      result += contributions[i].amount;
    }
    return result;
  }

  // TESTING/UI HELPERS
  // These functions are not crucial to contract functionality but useful for 
  // testing and UI 

  /**
    @dev calculates whether or not the Campaign is Active
    Will not return false positive on Pending state becuase endDate will be 0
   */
  function isActive() public view returns(bool) {
    return (block.timestamp < endDate);
  }

  /**
    @dev returns the current block timestamp
    Used in testing.
   */
  function getBlockTimestamp() public view returns(uint) {
    return block.timestamp;
  }

  /**
    @dev triggers the transtionCampaign modifier
   */
  function transitionCampaign() public
    stoppedInEmergency
    transitionState 
  {
    
  }

  /**
    @dev Returns uint representation of campaignState
    Only used in TestEthFundMe Solidity Test since we can't check enum returns
 */
  function getCampaignState() public view returns(uint) {
    return uint(campaignState);
  }

}