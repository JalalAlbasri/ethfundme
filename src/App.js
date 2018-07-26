import React, { Component } from 'react'
import { AccountData, ContractData } from 'drizzle-react-components'

import './App.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <p> truffle react app </p>
        <p> AccounData Component</p>
        <AccountData accountIndex="0" unit="ether" precision="3" />
        <p> ContractData Component </p>
        <p> 
          numCampaigns: <ContractData contract="EthFundMe" method="getNumCampaigns" />
        </p>
        <p>
          numAdmins: <ContractData contract="EthFundMe" method="getNumAdmins" />
        </p>
      </div>
    )
  }
}

export default App
