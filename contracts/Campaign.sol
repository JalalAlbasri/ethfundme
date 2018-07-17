pragma solidity ^0.4.24;

import "./EthFundMe.sol";
// import "./Approvable.sol";

contract Administrated {
  EthFundMe efm;
  
  constructor(address efmAddress) public {
    efm = EthFundMe(efmAddress);
  }

  modifier onlyAdmin {
    require(efm.isAdmin(msg.sender));
    _;
  }

}

contract Approvable is Administrated {

  enum ApprovalStages {
    Commit,
    Reveal,
    Concluded
  }

  ApprovalStages public approvalStage = ApprovalStages.Commit;
  // uint public creationTime = now;

  uint votesFor;		    /// tally of votes supporting proposal
  uint votesAgainst;      /// tally of votes countering proposal

  uint public numVotes;
  uint public numReveals;
  mapping(address => bytes32) public votes;
  mapping(address => bool) public hasVoted;
  mapping(address => bool) public hasRevealed;


  constructor(address efmAddress) Administrated(efmAddress) public {
    
  }

  modifier atStage(ApprovalStages _approvalStage) {
    require(approvalStage == _approvalStage);
    _;
  }

  modifier endCommit() {
    _;
    if (numVotes == 3) {
      approvalStage = ApprovalStages.Reveal;
    }
  }

  modifier endReveal() {
    _;
    if (numReveals == 3) {
      approvalStage = ApprovalStages.Concluded;
      // tallyVotes(); 
    }
  }

  modifier onlyVotedAdmin() {
    require(hasVoted[msg.sender]);
    _;
  }

  // modifier onlyDuringCommit() {
  //   require(approvalStage == ApprovalStages.Commit);
  //   _;
  // }

  modifier onlyDuringStage(ApprovalStages _stage) {
    require(approvalStage == _stage);
    _;
  }

  // function nextStage() internal {
  //     stage = Stages(uint(stage) + 1);
  // }

  // modifier timedTransitions() {
  //     if (stage == Stages.Commit &&
  //                 now >= creationTime + 10 minutes)
  //         nextStage();
  //     if (stage == Stages.Reveal &&
  //             now >= creationTime + 10 minutes)
  //         nextStage();
  //     _;
  // }

  function vote(bytes32 secretVote) public onlyAdmin onlyDuringStage(ApprovalStages.Commit) endCommit {
    votes[msg.sender] = secretVote;
    if (hasVoted[msg.sender] == false) {
      numVotes++;
      hasVoted[msg.sender] = true;
    }
  }

  function reveal(bool voteOption, uint salt) public onlyVotedAdmin onlyDuringStage(ApprovalStages.Reveal) endReveal {
    require(hasRevealed[msg.sender] == false);
    require(keccak256(abi.encodePacked(voteOption, salt)) == votes[msg.sender]);
    hasRevealed[msg.sender] = true;
    numReveals++;
  }

  function testHash(uint test) public pure returns(bytes32) {
    return keccak256(abi.encodePacked(test));
  }

  function testHashBool(bool voteOption, uint salt) public pure returns(bytes32) {
    return keccak256(abi.encodePacked(voteOption, salt));
  }

  // function getNumVotes() public view returns (uint) {
  //   return numVotes;
  // }

}

contract Campaign is Approvable {
  enum States {
    Pending, 
    Open, 
    Closed,
    Rejected
  }

  struct Contribution {
    uint amount;
    uint timestamp;
  }

  struct Contributor {
    uint amountContributed;
    Contribution[] contributions;
  }

  States public state;
  uint public id;
  string public title;
  uint public goal;
  address public manager;
  mapping (address => Contributor) public contributors;
  uint public funds;

  constructor(uint _id, string _title, uint _goal, address _manager, address efmAddress) Approvable(efmAddress) public {
    id = _id;
    title = _title;
    goal = _goal;
    manager = _manager;
    state = States.Pending;
    //TODO: create a poll for administrators to approve/reject the campaign.
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