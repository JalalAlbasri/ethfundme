# EthFundMe

EthFundMe is a smart contract powered crowd funding platform. It allows you to intelligently, securely and trustlessly manage crowd funding campaigns with smart contracts.

EthFundMe was developed for the 2018 Consensys Academy Developer Program. Please use care if you use any code from this repository in your own projects as it has not been thoroughly audited.

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

For more details check out the setup script *setup.js*

### Starting Webpack Server

The EthFundMe frontend is configured to run with a webpack development server

Ensure webpack-dev-server is installed (see [Prerequisites](#Prerequisites)) then run the following command
to start the webpack development server

```
npm run start
```

You can access the frontend from your browser on http://localhost:8080 to interact with the project.



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
