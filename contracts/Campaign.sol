pragma solidity ^0.4.24;

import "./EthFundMe.sol";
import "./EmergencyStoppable.sol";
import "../node_modules/zeppelin-solidity/contracts/ReentrancyGuard.sol";

contract Approvable is EmergencyStoppable {
  /**
    Implement EmergencyStoppable Interface
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
  event voteCommitted (address indexed voteCommiter);
  event voteRevealed (address indexed voteRevealer);
  event allVotesComitted();
  event votePassed (bool isApproved);



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

  /**
    STATE VARIABLES
   */

  Administrated public administrated;

  ApprovalStates public approvalState = ApprovalStates.Commit;
  
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
   constructor (address administeredAddress) public
   {
     administrated = Administrated(administeredAddress);
   }

  /**
    MODIFIERS
   */

  // ACCESS RESTRICTION
  modifier onlyAdmin() {
    require(administrated.isAdmin(msg.sender), "only admin authorized");
    _;
  }

  modifier onlyVotedAdmin() {
    require(hasVoted[msg.sender] == true, "Admin has not voted");
    _;
  }

  modifier onlyNotRevealedAdmin() {
    require(hasRevealed[msg.sender] == false, "Admin has already revealed");
    _;
  }

  // STATE MANAGEMENT
  modifier onlyDuringApprovalState(ApprovalStates _approvalState) {
    require(approvalState == _approvalState, "Invalid approval state");
    _;
  }

  modifier endCommit() {
    _;
    if (numVoteSecrets == administrated.numAdmins()) {
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
  function onApproval() internal;
  function onRejection() internal;

  // INTERFACE
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

contract Campaign is Approvable, ReentrancyGuard {
  
  /**
    EVENTS
   */
  event campaignStarted (
    uint startDate
  );
  
  event campaignEnded (
    uint endDate
  );

  event campaignCancelled (
    uint cancelledDate
  );

  event contributionMade (
    address contributor,
    uint amount
  );

  event withdrawlMade (
    address beneficiary,
    uint amount 
  );

  /**
    DATA STRUCTURES
   */

  enum CampaignStates {
    Pending,
    Active,
    Successful,
    Unsuccessful,
    Cancelled
  }

  struct Contribution {
    address addr;
    uint amount;
    uint timestamp;
  }

  /**
    STATE VARIABLES
   */

  CampaignStates public campaignState = CampaignStates.Pending;


  uint public funds = address(this).balance;
  uint public endDate;

  uint public id;
  string public title;
  uint public goal;
  uint public duration;
  string public description;
  string public image;
  address public manager;

  Contribution[] public contributions;
  mapping (address => uint) public totalContributed;
  mapping (address => bool) public hasContributed;
  mapping (address => bool) public hasWithdrawn;

  /**
    CONSTRUCTOR
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
  modifier onlyManager() {
    require(msg.sender == manager, "Only campaign manager authorized");
    _;
  }

  modifier onlyNotManager() {
    require(msg.sender != manager);
    _;
  }

  modifier onlyManagerOrAdmin() {
    // FIXME: Is this modifier still used/required? 
    require(msg.sender == manager || administrated.isAdmin(msg.sender), "Only campaign manager or admin authorized");
    _;
  }

  modifier onlyHasNotWithdrawn() {
    require(hasWithdrawn[msg.sender] == false, "User has already withdrawn");
    _;
  }

  modifier onlyHasContributed() {
    require(hasContributed[msg.sender] == true, "User has not contributed");
    _;
  }

  // STATE MANAGEMENT

  modifier onlyDuringCampaignState(CampaignStates _campaignState) {
    require(campaignState == _campaignState, "Incorrect campaignState for function");
    _;
  }

  modifier onlyBeforeCampaignEnd() {
    require(campaignState <= CampaignStates.Active, "Campaign must be active");
    _;
  }

  modifier onlyAfterCampaignEnd() {
    require(campaignState > CampaignStates.Active, "Campaign must have ended");
    _;
  }

  // FIXME: Could be renamed to endCampaign
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

  modifier validateContribution() {
    //No Zero Contributions
    require(msg.value > 0, "No zero contributions"); 
     //Integer Overflow Protection
    require(funds + msg.value > funds, "Integer overflow check failed");
    require(totalContributed[msg.sender] + msg.value > totalContributed[msg.sender], "Integer overflow check failed");
    _;
  }

  // PRIVATE FUNCTIONS

  function onApproval() internal 
  {
    endDate = block.timestamp + duration;
    campaignState = CampaignStates.Active;
    emit campaignStarted(block.timestamp);
  }

  function onRejection() internal
  {
    campaignState = CampaignStates.Unsuccessful;
  }

  function managerWithdrawl() internal 
    onlyManager
  {
      hasWithdrawn[msg.sender] = true;
      funds = 0;
      emit withdrawlMade(msg.sender, address(this).balance);
      msg.sender.transfer(address(this).balance);
  }

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

  // FIXME: Consider removing this function. It's essentially unnecessary since withdraw will end the campaign
  // but it exists as a formal way of ending the campaign.
  function endCampaign() public 
    stoppedInEmergency
    onlyManagerOrAdmin
    transitionState
    onlyAfterCampaignEnd
  {
    emit campaignEnded(block.timestamp);
  }

  // Wrapper to private function doing the actual work as described in ReentrancyGuard.sol
  function withdraw() external
    stoppedInEmergency
    nonReentrant // TODO: How do we test, need a reentrancy contract to call this function.
    onlyHasNotWithdrawn
    transitionState 
    onlyAfterCampaignEnd 
  {
    if (campaignState == CampaignStates.Successful) {
      managerWithdrawl();
    }

    if(campaignState == CampaignStates.Unsuccessful || campaignState == CampaignStates.Cancelled) {
      contributorWithdrawl();
    }
  }

  function emergencyWithdraw() external
    onlyInEmergency
    nonReentrant
    onlyHasNotWithdrawn
  {
    contributorWithdrawl();
  }

  // GETTERS

  function getNumContributions() public view returns(uint numContributions) {
    return contributions.length;
  }

    function getTotalContributedFunds() public view returns(uint) {
    uint result = 0;
    for (uint i = 0; i < contributions.length; i++) {
      result += contributions[i].amount;
    }
    return result;
  }

  // UI HELPERS

  function isActive() public view returns(bool) {
    return (block.timestamp < endDate);
  }

  function getBlockTimestamp() public view returns(uint) {
    return block.timestamp;
  }

  function transitionCampaign() public
    stoppedInEmergency
    transitionState 
  {
    
  }

  // Returns uint representation of campaignState
  // Only used in TestEthFundMe Solidity Test since we can't check enum returns
  function getCampaignState() public view returns(uint) {
    return uint(campaignState);
  }

}