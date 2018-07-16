pragma solidity ^0.4.24;

// import "./Approvable.sol";
import "./Campaign.sol";

contract EthFundMe {
  // address[] public admins;
  // struct Admin {
  //   address addr;
  //   bool approved;
  // }

  address[] public admins;
  mapping (address=> bool) public isAdmin;

  //FIXME: Should we just use an array?
  address[] public campaigns;

  /**
    Allows initialization of the contract with up to 3 admins
   */

  constructor(address[] _admins) public {
    //FIXME: Can I put a require statement in a contructor?
    // What happens if it fails?
    require(_admins.length <= 3);
    
    admins = _admins;
    for (uint i = 0; i < admins.length; i++) {
      isAdmin[admins[i]] = true;
    }
  }

  function getNumAdmins() public view returns (uint) {
    return admins.length;
  }

  function getNumCampaigns() public view returns (uint) {
    return campaigns.length;
  }

  function createCampaign(string title, uint goal) public returns(address) {
    Campaign newCampaign = new Campaign(campaigns.length, title, goal, msg.sender);
    campaigns.push(address(newCampaign));
    return address(newCampaign);
  }


}

