pragma solidity ^0.4.24;

import "./EthFundMe.sol";
// import "./Approvable.sol";

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

  enum PollStates {
    Commit,
    Reveal,
    Concluded
  }

  enum ApprovalStates {
    Pending,
    Approved,
    Rejected
  }

  PollStates public pollState = PollStates.Commit;
  ApprovalStates public approvalState = ApprovalStates.Pending;

  uint public numApprovals;
  uint public numRejections;

  uint public numVotes; //TODO: change to numVoteSecrets
  uint public numReveals; //TODO: change to numVoteReveals

  mapping(address => bytes32) public voteSecrets;
  mapping(address => bool) public hasVoted;
  mapping(address => bool) public hasRevealed;


  constructor(address efmAddress) Administrated(efmAddress) public {
    
  }

  modifier onlyDuringPollState(PollStates _pollState) {
    require(pollState == _pollState);
    _;
  }

  modifier onlyVotedAdmin() {
    require(hasVoted[msg.sender]);
    _;
  }

  modifier endCommit() {
    _;
    if (numVotes == 3) {
      pollState = PollStates.Reveal;
    }
  }

  modifier tallyVotes(bool voteOption) {
    _;
    
  }

  modifier endReveal() {
    _;
    
    if (numReveals == 3) {
      pollState = PollStates.Concluded;
      
      if (numApprovals >= 2) {
        approvalState = ApprovalStates.Approved;
      } else {
        approvalState = ApprovalStates.Rejected;
      }
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

  function vote(bytes32 secretVote) public onlyAdmin onlyDuringPollState(PollStates.Commit) endCommit {
    voteSecrets[msg.sender] = secretVote;
    if (hasVoted[msg.sender] == false) {
      numVotes++;
      hasVoted[msg.sender] = true;
    }
  }

  function reveal(bool voteOption, uint salt) public onlyVotedAdmin onlyDuringPollState(PollStates.Reveal) endReveal {
    require(hasRevealed[msg.sender] == false);
    require(keccak256(abi.encodePacked(voteOption, salt)) == voteSecrets[msg.sender]);
    
    hasRevealed[msg.sender] = true;
    numReveals++;

    if (voteOption) {
      numApprovals++;
    } else {
      numRejections++;
    }
  }
}

contract Campaign is Approvable {

  enum CampaignStates {
    PendingApproval,
    Open,
    Success,
    Fail
  }

  struct Contribution {
    uint amount;
    uint timestamp;
  }

  struct Contributor {
    uint amountContributed;
    Contribution[] contributions;
  }

  CampaignStates public campaignState = CampaignStates.PendingApproval;

  uint public id;
  string public title;
  uint public goal;
  address public manager;
  uint public funds;

  mapping (address => Contributor) public contributors;

  modifier onlyDuringCampaignState(CampaignStates _campaignState) {
    require(campaignState == _campaignState);
    _;
  }

  constructor(uint _id, string _title, uint _goal, address _manager, address efmAddress) Approvable(efmAddress) public {
    id = _id;
    title = _title;
    goal = _goal;
    manager = _manager;
  }

  function contribute() public payable {
    //FIXME: check msg.value is positive integer
    contributors[msg.sender].contributions.push(Contribution(msg.value, now));
    
    //FIXME: Check these for integer overflow
    contributors[msg.sender].amountContributed += msg.value;
    funds += msg.value;
  }
  
  //FIXME: what happens if address passed in hasn't made a contribution?
  //maybe need to require that a contributor exists at that address
  function getNumContributions(address contributor) public view returns(uint numContributions) {
    numContributions = contributors[contributor].contributions.length;
  }

  function getContribution(address contributor, uint i) public view returns(uint amount, uint timestamp) {
    amount = contributors[contributor].contributions[i].amount;
    timestamp = contributors[contributor].contributions[i].timestamp;
  }

}