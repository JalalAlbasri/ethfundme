pragma solidity ^0.4.24;

import "./EthFundMe.sol";
// import "./Approvable.sol";
// TODO: Split Contract Files

// It is a good practice to structure functions which interact
// with other contracts (i.e. call functions or send Ether)
// into three phases:
// 1. check conditions
// 2. perform actions (potentially change conditions)
// 3. interact with other contracts
// If these phases get mixed up, the other contract might call
// back into the current contract and change the state or cause
// effects (ether payout) to be done multiple times.
// If functions that are called internally include interactions with external
// contracts, they have to be considered interaction with
// external contracts too.

contract Administrated {
  EthFundMe public efm;
  
  constructor(address efmAddress) public {
    efm = EthFundMe(efmAddress);
  }

  modifier onlyAdmin {
    require(efm.isAdmin(msg.sender));
    _;
  }

}

contract Approvable is Administrated {

  enum ApprovalStates {
    Commit,
    Reveal,
    Approved,
    Rejected
  }

  ApprovalStates public approvalState = ApprovalStates.Commit;

  uint public numApprovals;
  uint public numRejections;

  uint public numVoteSecrets;
  uint public numVoteReveals;

  mapping(address => bytes32) public voteSecrets;
  mapping(address => bool) public hasVoted;
  mapping(address => bool) public hasRevealed;


  constructor(address efmAddress) Administrated(efmAddress) public {
    
  }

  function onApproval() internal;
  function onRejection() internal;

  modifier onlyDuringApprovalState(ApprovalStates _approvalState) {
    require(approvalState == _approvalState);
    _;
  }

  modifier onlyVotedAdmin() {
    require(hasVoted[msg.sender]);
    _;
  }

  modifier endCommit() {
    _;
    if (numVoteSecrets == 3) {
      approvalState = ApprovalStates.Reveal;
    }
  }

  modifier tallyVotes(bool voteOption) {
    _;
    
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

  // modifier timedTransitions() {
  //     if (stage == Stages.Commit &&
  //                 now >= creationTime + 10 minutes)
  //         nextStage();
  //     if (stage == Stages.Reveal &&
  //             now >= creationTime + 10 minutes)
  //         nextStage();
  //     _;
  // }

  function vote(bytes32 secretVote) public onlyAdmin onlyDuringApprovalState(ApprovalStates.Commit) endCommit {
    voteSecrets[msg.sender] = secretVote;
    if (hasVoted[msg.sender] == false) {
      numVoteSecrets++;
      hasVoted[msg.sender] = true;
    }
  }

  function reveal(bool voteOption, uint salt) public onlyVotedAdmin onlyDuringApprovalState(ApprovalStates.Reveal) endReveal {
    require(hasRevealed[msg.sender] == false);
    require(keccak256(abi.encodePacked(voteOption, salt)) == voteSecrets[msg.sender]);
    
    hasRevealed[msg.sender] = true;
    numVoteReveals++;

    if (voteOption) {
      numApprovals++;
    } else {
      numRejections++;
    }
  }
}

// TODO: Timed Campaign
// TODO: Payout on Campaign End

contract Campaign is Approvable {

  /**
    DATA STRUCTURES 
   */


  enum CampaignStates {
    Pending,
    Active,
    Successful,
    Unsuccessful
  }

  struct Contribution {
    uint amount;
    uint timestamp;
  }

  struct Contributor {
    uint totalContributed;
    uint numContributions;
    mapping (uint => Contribution) contributions;
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
  address public manager;

  uint public numContributors;
  mapping (address => Contributor) public contributors;
  mapping (address => bool) public hasContributed;

  /**
    CONSTRUCTOR
   */

  constructor(uint _id, string _title, uint _goal,  uint _duration, address _manager, address efmAddress) Approvable(efmAddress) public {
    id = _id;
    title = _title;
    goal = _goal;
    duration = _duration * 1 days;
    manager = _manager;
  }

  // STATE TRANSITION/RESTRICTION

  modifier onlyDuringCampaignState(CampaignStates _campaignState) {
    require(campaignState == _campaignState);
    _;
  }

  modifier onlyBeforeCampaignEnd() {
    require(campaignState <= CampaignStates.Active);
    _;
  }

  modifier onlyAfterCampaignEnd() {
    require(campaignState > CampaignStates.Active);
    _;
  }

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

  // ACCESS RESTRICTION

  modifier notManager() {
    require(msg.sender != manager);
    _;
  }

  modifier onlyManagerOrAdmin() {
    require(msg.sender == manager || efm.isAdmin(msg.sender));
    _;
  }

  // INPUT VALIDATION

  modifier validateContribution() {
    //No Zero Contributions
    require(msg.value > 0); 
     //Integer Overflow Protection
    require(funds + msg.value > funds);
    require(contributors[msg.sender].totalContributed + msg.value > contributors[msg.sender].totalContributed);
    _;
  }
  
  //FIXME: Logic in this modifier doesn't belong in a modifier.
  modifier newContributor() {
    if (!hasContributed[msg.sender]) {
      contributors[msg.sender] = Contributor({
        totalContributed: 0,
        numContributions: 0
      });
      hasContributed[msg.sender] = true;
      numContributors++;
    }
    _;
  }

  /**
    FUNCTIONS
   */

  // INTERNAL FUNCTIONS

  function onApproval() internal {
    campaignState = CampaignStates.Active;
    endDate = now + duration;
  }

  function onRejection() internal {
    campaignState = CampaignStates.Unsuccessful;
  }

  // INTERFACE

  function contribute() public payable 
    notManager 
    transitionState
    onlyDuringCampaignState(CampaignStates.Active)
    newContributor 
    validateContribution {
      contributors[msg.sender].contributions[contributors[msg.sender].numContributions] = Contribution(msg.value, now);
      contributors[msg.sender].numContributions++;
      contributors[msg.sender].totalContributed += msg.value;
      funds += msg.value;
    }
  
  function cancelCampaign() public
    onlyManagerOrAdmin
    transitionState
    onlyBeforeCampaignEnd
    // FIXME: Only during campaign states pending/active
    // onlyBeforeEndDate {
    {
      campaignState = CampaignStates.Unsuccessful;
      // payout();
    }

  function endCampaign() public 
    onlyManagerOrAdmin
    transitionState
    onlyAfterCampaignEnd
    // onlyDuringCampaignStates(CampaignStates[].push(CampaignStates.Successful))
    // onlyDuringCampaignStates([CampaignStates.Successful])
    // FIXME: Only during campaign states successful/unsuccessful
    // onlyDuringCampaignState(CampaignStates.Active) {
    {
      // payout();
    }

  // GETTERS

  function getTotalContributed(address contributor) public view returns(uint totalContributed) {
    totalContributed = contributors[contributor].totalContributed;
  }
  
  function getNumContributions(address contributor) public view returns(uint numContributions) {
    numContributions = contributors[contributor].numContributions;
  }

  function getContribution(address contributor, uint i) public view returns(uint amount, uint timestamp) {
    amount = contributors[contributor].contributions[i].amount;
    timestamp = contributors[contributor].contributions[i].timestamp;
  }

  // HELPERS

  function isActive() public view returns(bool) {
    return (block.timestamp < endDate);
  }

  function getBlockTimestamp() public view returns(uint) {
    return block.timestamp;
  }

}