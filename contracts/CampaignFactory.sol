pragma solidity ^0.4.24;

import "./Administrated.sol";
import "./EmergencyStoppable.sol";
import "./Campaign.sol";

/**
  @title CampaignFactory
  @dev The Initial Contract deployed by this project.
  
  CampaignFactory has a single function in it's interface, createCampaign that is intended
  to be used by Users creating a new Crowd Funding Campaign.
  
  Create Campaign is the Campaign Factory function that will deploy a new instance of
  the Campaign Contract.

  CampaignFactory extends the Administrated and EmergencyStoppable Contracts. Allowing it to access
  Admin verification and management functions and EmergencyStoppable behaviour.

  It passes it's own address to the Campaign Contract constructor so that Campaigns can 
  access Administrated Admin verification functions through CampaignFactory.
 */

contract CampaignFactory is Administrated, EmergencyStoppable {

  /**
    Implement EmergencyStoppable Interface
   */

  /**
    @dev returns true if msg.sender has the admin role
    This funstion is required to be implemented by the EmergencyStoppable Interface.
    It is used to determine if the calling user (msg.sender) has the authority to stop/start
    the contract.
   */
  function isAuthorized() internal 
    returns(bool)
  {
    return isAdmin(msg.sender);
  }
  
  constructor() public {
  }

  /**
    EVENTS
   */

  /**
    @dev Event emitted when a Campaign is created from the Campaign Factory
    The payload is the newly created Campaign's address
   */
  event LogCampaignCreated (
    address indexed campaignAddress
  );

  /**
    STATE VARIABLES
  */

  // array to hold addresses of campaigns
  address[] public campaigns;

  /**
    INTERFACE
   */
  /**
    @dev Creates a new Campaign Contract and deploys it.
    @param title The title of the Campaign
    @param goal The funding goal in ether of the campaign
    @param duration The intended duration of the Active campaign in days
    @param description A description of the Campaign purposes
    @param image The url of an image for the campaign

    The main interface function for this Contract. Creates and deploys and new Campaign Contract
    It passes msg.sender as the campaign manager and the address of this contract so that Camapaign
    Contracts can access Administrated functionality (verifying admins)
   */
  function createCampaign(string title, uint256 goal, uint256 duration, string description, string image) public 
    stoppedInEmergency
    notAdmin
    returns(address)
  {
    Campaign newCampaign = new Campaign(campaigns.length, title, goal, duration, description, image, msg.sender, address(this));
    campaigns.push(address(newCampaign));
    emit LogCampaignCreated(address(newCampaign));
    return address(newCampaign);
  }

  /**
    GETTERS
   */

  /**
    @dev returns the number of campaigns created
    Since we use an array to hold the campaigns we dont need a numCampaigns variable
    like if we had used a mapping but we need a getter function if we want to get the 
    length of the array
   */
  function getNumCampaigns() public view returns (uint256) {
    return campaigns.length;
  }

}

