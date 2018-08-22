# EthFundMe

EthFundMe is a smart contract powered crowd funding platform. It allows you to intelligently, securely and trustlessly manage crowd funding campaigns with smart contracts.

EthFundMe was developed for the 2018 Consensys Academy Developer Program. Please use care if you use any code from this repository in your own projects as it has not been thoroughly audited.

## About the project

EthFundMe is an adaptation of the "Online Marketplace" Final Project Idea. Instead of a marketplace with items for sale however we have crowd funding campaigns that users can create and contribute
to to raise funds similar to popular crowdfunding platforms [kickstarter](http://kickstarter.com), [gofundme](http://gofundme.com) and [indiegogo](http://indigogo).

### Why Crowdfunding?

Crowdfunding is a problem that can benefit greatly from a trustless smart contract based solution. Campaigns in EthFundMe are modelled as smart contracts that Campaign Managers and Contributors enter into. Once the Campaign is active funds contributed can be trustlessly managed by the smart contract and distrubuted instantly and securely through the Ethereum blockchain once the Campaign is concluded.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Installing

```
git clone http://github.com/jalalalbasri/EthFundMe.git
cd EthFundMe
npm install
```

### Prerequisites

EthFundMe requires truffle and is configured to use ganache-cli as a test blockchain

The fontend is configured to run with webpack-dev-server

If you do not have truffle or ganache-cli or the webpack dev server installed you can install them with

```
npm install --global truffle@4.1.14 ganache-cli@6.1.8 webpack-dev-server
```

EthFundMe was tested with truffle version 4.1.14 and ganache-cli version 6.1.8 (latest at the time of writing this).

Please ensure you are using the correct version if you run into difficulties testing/deploying.

### Testing

Truffle tests are location in the [test](/test) directory.

Start a development blockchain with

```
ganache-cli
```

In another terminal window navigate to the project folder and run

```
truffle test
```

The truffle tests will now run

## Running the Frontend

### Running the development blockchain for Drizzle

The EthFundMe frontend is built with drizzle-react and drizzle-react-components.

Drizzle requires the development blockchain to be run with increased block minig delay.

Run the development blockchain with -b 3 to increase the block minig delay.

```
ganache-cli -b 3
```
### Configuring metamask

Copy the 12 word mnemonic (seed phrase) given by ganache-cli in the previous command.

In metamask click on "Import using account seed phrase" and paste in the 12 word seed phrase from ganache-cli.

Ensure that metamask is connected to "Localhose 8545"

### Running setup script

A setup script has been provided [setup.js](/setup.js) that will set up accounts and data to interact with from the frontend.

From the project directory run

```
truffle exec setup.js
```

The setup script will set the metamask accounts 0, 1, and 2 as admins. 

You can use these accounts in metamask to interact with the DApp as an admin.

It will create dummy Campaigns in their difference lifecycle stages.

metamask account 4 is the Campaign Manager for all Campaigns.

The remaining metamask accounts are regular users that have made contributions.

For more details check out the setup script [setup.js](/setup.js)

### Starting Webpack Server

The EthFundMe frontend is configured to run with a webpack development server

Ensure webpack-dev-server is installed (see [prerequisites](#prerequisites)) then run the following command
to start the webpack development server

```
npm run start
```

You can access the frontend from your browser on http://localhost:8080 to interact with the project.

## EthFundMe Contracts in Detail

This section explains the detailed workings of the EthFundMe DApp. Following this sections are User Stories that should cement the logic behind the workings of the EthFundMe Contracts.

### The CampaignFactory
The Initial Contract deployed is the [CampaignFactory](/contracts/CampaignFactory.sol) Contract. 

The [CampaignFactory](/contracts/CampaignFactory.sol) is a *FactoryContract* that has a single interface function *createCampaign* that allows a user to create a [Campaign](/contracts/Campaign.sol) Contract.

The user creating the campaign will be the *Campaign Manager* once the Campaign is created.

It also holds addresses of created Campaigns in an array that is used by the UI to retrieve Campaign Information.

Please see [CampaignFactory](/contracts/CampaignFactory.sol) for details on the CampaignFactory contract.

### Administrated and Admin Management
[CampaignFactory](/contracts/CampaignFactory.sol) extends the [Administrated](/contracts/Administrated.sol) contract which utilizes the [OpenZeppelin Role Based Access Control Library](https://openzeppelin.org/api/docs/ownership_rbac_RBAC.html)
to implement access control based on an *admin* role.

[Administrated](/contracts/Administrated.sol) implements all the logic associated with granting/revoking admins priviledges from accounts and provides modifiers that can be used to *restrict access* based on the admin role.

Initially the deploying account (accounts[0] in metamask/web3) is designated the *admin* role. And is given the ability to grant other accounts the admin role.

Admins are also responsible for approving or rejecting Campaigns created by users in a *Commit/Reveal* voting process.

Plase see [Administrated](/contracts/Administrated.sol) for details on admin management.

### Campaigns (Where the magic happens)
The [Campaign](/contracts/Campaign.sol) models a crowd funding campaign and is a smart contract entered into by the Campaign Manager and any contributors.

It holds all the Campaign information such as title, funding goal, duration descriptions etc. and has an interface that allows contributors to make Ether contributions.

Campaigns have a *LifeCycle* and begin in a *Pending* state. In This state they are Pending Approval from admins before going *Active* and cannot accept any contributions. *Rejected* Campaigns never begin.
Campaign Approvals are managed by extending the [Approvable](/contracts/Approvable.sol) contract.

If a Campaign is *Approved* and it is put in the *Active* State, given an *endDate* based on it's specified duration begins accepting *Contributions*.

The Campaign will accept contributions until it reaches its *endDate*.

If the funding goal specified by the Campaign Manager is met by the end of the Campaign the Campaign Manager will be able to withdraw all the raised funds from the Contract via a *PullWithdrawl* patern.

If however the funding goal is not met by the end of the Campaign or the Campaign is , Contributors will be allowed to retrieve their contributed funds from the Contract also via a *PullWithdrawl* Pattern.

Campaign Managers also have the ability to *Cancel* the Campaign at any time before the campaign is over. If the Campaign is cancelled with contributions in it or if it is *EmergencyStopped* (see [EmergencyStoppable](#emergencystoppable) below) by an admin contributors will be allowed to withdraw the funds they have contributed.

### Approvable

The [Approvable](/contracts/Approvable.sol) Contract is an *Abstract Contract* that will give the ability for a contract to be approved/rejected. It provides the logic for *Authorzed* accounts to vote on Approval in a *Commit/Reveal* Pattern.

Voting is managed through *Lifecycles* and the Contract begins in the *Commit* stage.

*Authorized* accounts first place a vote by comitting a *keccak256* encrypted vote secret consisting of a voteOption (true or false) and a salt. All voters are required to vote during the *Commit* phase.

Once all votes are in the contract transitions into the *Reveal* phase where the voters reveal their votes by supplying their vote option and salt. If the comitted voteSecret matches the vote option and salt supplied in reveal the vote is counted.

The cote passes if at least 50% of voters reach a consensus. The campaign does not require all voters to reveal and will transition the state into *Approved* or *Rejected* once enough votes to reach an outcome have been counted.

Contracts extending [Approvable](/contracts/Approvable.sol) must implement the *isAuthorized* and *numVoters* functions that will be used to determine if an account is authorized to vote and how many voter there are.

Contracts extending [Approvable](/contracts/Approvable.sol) must also implement the *onApproval* and *onRejection* funcstion that will be called once a voted is concluded and an outcome is reached.

In EthFundMe these are implemented by the Campaign contract and only *admins* are authorized to vote.

### EmergencyStoppable

The [EmergencyStoppable](#emergencystoppable) Contract implements the *Emergency Stoppable* Pattern sometimes called the *Circuit Breaker* or *Pausible* pattern.

Contracts that extend EmergencyStoppable have the ability to be put in a stopped state. EmergencyStoppable provides mmodifiers that can be used to restrict functions from running in the stopped state or only run in a stopped state.

Contracts extending this must implement the *isAuthorized* adbstract function that will tell EmergencyStoppable is an account is authorized to stop the contract. In EthFundMe *admins* and authorized to stop both the CampaignFactory and Campaign contracts.

EmergencyStoppable is an adaptaion of the [Pausible](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/lifecycle/Pausable.sol) Contract from the Open Zeppelin Library but Pausible relies on a single owner with the 
priviledge to stop a contract. EmergencyStoppable has been upgraded to allow multiple authorized users to stop the contract through the *isAuthorized* abstract function.

Both the [CampaignFactory](/contracts/CampaignFactory.sol) and [Campaign](/contracts/Campaign.sol) contracts extend EmergencyStoppable. 

If the CampaignFactory is stopped it will not allow new Campaigns to be created.

If a Campaign is stopped it will not accept new contributions however Contributors will be allowed to recover any existing Contributions through the *EmergencyWithdraw* function. The *EmergencyWithdraw* function can only be access when a Campaign is in a stopped state.

## User Stories

User Stories are a great way to cement the logic behind how an application is intended to be used. Here are a few user stories for the major intended use cases of the EthFundMe DApp.

### #1 Creating a Campaign.

- A Non Admin User access the DApp.
- The User Creates a Campaign specifying campaign details including a funding goal and duration.
- The Campaign is creating in the Pending State, awaiting admin Approval.

### #2 Rejecting and Campaign
- An Admin user access the DApp.
- The Admin users reviews Campaigns in the Commit Stage.
- The Admin users places a Vote on the Campaign of false for rejectiong and supplying a Salt for vote encryption.
- The vote option along with the salt is encrypted with and Comitted.
- All admins have voted and the Campaign's Approval State transitions into the Reveal Stage.
- The Admin *Reveals* their vote by supplying their original vote option (false) and the Salt used to encrypt the vote secret.
- The VoteSecret is verified by the DApp and the vote is counted.
- Enough Votes have been counted and the Approval State is transitioned to Rejected.
- The Campaign has been Rejected and it never begins.

### #3 Approving a Campaign

- An Admin user access the DApp.
- The Admin users reviews Campaigns in the Commit Stage.
- The Admin users places a Vote on the Campaign of true for approval and supplying a Salt for vote encryption.
- The vote option along with the salt is encrypted with and Comitted.
- All admins have voted and the Campaign's Approval State transitions into the Reveal Stage.
- The Admin *Reveals* their vote by supplying their original vote option (true) and the Salt used to encrypt the vote secret.
- The VoteSecret is verified by the DApp and the vote is counted.
- Enough Votes have been counted and the Approval State is transitioned to Approved.
- The Campaign has been Approved and it's Campaign State is transitioned to Active.
- The Campaign begins.

### #4 Contributing to a Campaign

- A user access the DApp.
- The find an Active Campaign that they are interested in Contributing to.
- The user places a contribution in ether to the Campaign.

### #5 Sucessful Campaign

- An Active Campaign has reached it's end date.
- The contributed funds meet or exceed the campaign goal.
- The Campaign State is transitioned to Successful.
- The Campaign Manager accesses the DApp. 
- The Campaign Manager is able to withdraw all Campaign funds from the Campaign Contract.

### #6 Unsuccessful Campaign

- An Active Campaign has reached it's end date.
- The contributed funds do not meet the campaign goal.
- The Campaign State if transitioned to Unsuccessful.
- The Campaign Manager accesses the DApp.
- The Campaign Manager is unable to withdraw Campaign funds from the Campaign Contract.
- A User who has contributed to the Campaign (Contributor) accesses the DApp.
- The Contributor is able to withdraw their contributed funds from the Campaign Contract.

### #7 Campaign Manager Cancels Active Campaign

- An Active Campaign has recevied contributions and reached it's goal but but not reached it's end date.
- The Campaign Manager accesses the DApp
- The Campaign Manager *Cancels* the campaign early frofeiting any funds in the Campaign.
- The Campaign is put into a *Cancelled* State.
- The Campaign Manager is unable to withdraw funds from the Campaign.
- A Contributor to the Campaign accesses the DApp.
- The Contributor is able to withdaw their contributed funds from the Cancelled Campaign Contract.

### #8 Pending Campaign is Emergency Stopped

- A New Campaign has been created and is in the *Commit* Approval State.
- An Admin places a vote approving the campaign.
- Another Admin suspects something is fishy with the Campaign.
- The Admin puts the Campaign into an EmergencyStopped State.
- A Third Admin tried to place a vote but cannot because the Campaign is in an EmergencyStopped State.
- An Admin realizes the Campaign is legit and Resumes the Campaign so that it is no longer Emergency Stopped.
- The voting process can now resume as normal. 

### #9 Active Campaign is Emergency Stopped

- An Active Campaign has received contributions but not reached it's end date.
- An Admin has reason to believe there is something fishy about the Campaign.
- The Admin puts the Campaign into an EmergencyStopped State.
- The Campaign Manager accesses the DApp.
- The Campaign Manager is unable to withdraw campaign funds from the DApp in an EmergencyStopped state.
- A Contributor accesses the DApp.
- The Contributor is able to withdraw all the funds they Contributed to the EmergencyStopped Campaign.
- The Admin realizes the the Campaign is legit and Resumes the Campaign.
- The Campaign is no longer in an Emergency Stopped state.
- The Contributor who withdrew their funds sees this and makes a similar contribution to the Campaign again.
- The Campaign concludes as normal allowing the Campaign Manager or Contributor to access funds once it is over






























What things you need to install the software and how to install them

```
Give examples
```

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc
