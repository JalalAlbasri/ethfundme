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


// TASK: Timed Approval
contract Approvable is Administrated {

  /**
    DATA STRUCTURES
   */

  enum ApprovalStates {
    Commit,
    Reveal,
    Approved,
    Rejected
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

  constructor(address efmAddress) Administrated(efmAddress) public {
    
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
    address addr;
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
  mapping (address => bool) hasWithdrawn;

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

  constructor(
    uint _id, 
    string _title, 
    uint _goal,  
    uint _duration, 
    address _manager, 
    address efmAddress
  ) Approvable(efmAddress) public {
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

  // ACCESS RESTRICTION

  modifier notManager() {
    require(msg.sender != manager);
    _;
  }

  modifier onlyManagerOrAdmin() {
    require(msg.sender == manager || efm.isAdmin(msg.sender));
    _;
  }

  modifier hasNotWithdrawn() {
    require(hasWithdrawn[msg.sender] == false);
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
        addr: msg.sender,
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
    endDate = now + duration;
    campaignState = CampaignStates.Active;
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
    {
      campaignState = CampaignStates.Unsuccessful;
    }

  // FIXME: Consider removing this function. It's essentially unnecessary since withdraw will end the campaign
  // but it exists as a formal way of ending the campaign.
  function endCampaign() public 
    onlyManagerOrAdmin
    transitionState
    onlyAfterCampaignEnd
    {
    }

  function withdraw() public 
    hasNotWithdrawn
    transitionState 
    onlyAfterCampaignEnd {
      if (campaignState == CampaignStates.Successful) {
        require(msg.sender == manager);
        hasWithdrawn[msg.sender] = true;
        funds = 0;
        msg.sender.transfer(funds);
      }

      if(campaignState == CampaignStates.Unsuccessful) {
        require(hasContributed[msg.sender] == true);
        hasWithdrawn[msg.sender] = true;
        funds -= contributors[msg.sender].totalContributed;
        msg.sender.transfer(contributors[msg.sender].totalContributed);
      }
  }

  // GETTERS
  // FIXME: Should the getters transition state?


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