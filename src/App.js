import React, { Component } from 'react'
import { AccountData, ContractData } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'

import CreateCampaignButtonContainer from './containers/CreateCampaignButtonContainer'
import AppDataContainer from './AppData'

import './App.css'

import store from './store'
console.log(`typeof web3: ${typeof web3}`)
console.log(`store.getState(): ${JSON.stringify(store.getState())}`)


class App extends Component {
  render() {
    return (
      <div className="App">
        {/* <p> truffle react app </p>
        <p> AccounData Component</p>
        <AccountData accountIndex="0" unit="ether" precision="3" />
        <p> ContractData Component </p>
        getNumCampaigns: <ContractData contract="EthFundMe" method="getNumCampaigns" />
        numCampaigns: <ContractData contract="EthFundMe" method="num" />
        <br />
        getNumAdmins: <ContractData contract="EthFundMe" method="getNumAdmins" />
        <p>
        <CreateCampaignButtonContainer />
        </p> */}
        <p> App Data Container </p>
        <AppDataContainer />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    EthFundMe: state.contracts.EthFundMe
  }
}

const AppContainer = drizzleConnect(App, mapStateToProps)

export default AppContainer
