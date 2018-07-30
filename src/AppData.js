import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import { Drizzle } from 'drizzle'
import { ContractData } from 'drizzle-react-components'

class AppData extends Component {
  render() {
    // const getNumAdmins = this.props.getNumAdmins
    const drizzleStatus = this.props.drizzleStatus
    // const num = this.props.num
    const EthFundMe = this.props.EthFundMe

    // if (drizzleStatus.initialized) {
    return (
        <div className="AppData">
          <p> drizzleStatus: {drizzleStatus.initialized.toString()} </p>
          {/* <p> getNumAdmins: {getNumAdmins} </p> */}
          {/* <p> num: {num} </p> */}
          <p>
            getNumAdmins: <ContractData contract="EthFundMe" method="getNumAdmins" />
          </p>
          <p>
            getNumCampaigns: <ContractData contract="EthFundMe" method="getNumCampaigns" />
          </p>
        </div>
    )
    // }
  }
}

const mapStateToProps = (state) => {
  // const dataKey = state.contracts.EthFundMe.getNumAdmins.cacheCall()
  console.log(state)
  // console.log(state.contracts.EthFundMe.getNumAdmins.data())
  // console.log(dataKey)
  return {
    // getNumAdmins: state.contracts.EthFundMe.getNumAdmins.data(),
    drizzleStatus: state.drizzleStatus,
    EthFundMe: state.contracts.EthFundMe
    // num: state.contracts.EthFundMe.num
  }
}

const AppDataContainer = drizzleConnect(AppData, mapStateToProps)
export default AppDataContainer
