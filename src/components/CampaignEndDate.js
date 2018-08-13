import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Moment from 'react-moment'

class CampaignEndDate extends Component {
  constructor(props) {
    super(props)
    this.state = {
      timestamp: 0
    }
  }

  componentDidMount() {
    web3.eth.getBlock('latest', (err, block) => {
      console.log(`block.timestamp: ${block.timestamp}`)
      this.setState({
        timestamp: new Date(block.timestamp * 1000)
      })
    })
  }


  render() {
    if (this.props.endDate > 0) {
      const endDate = new Date(this.props.endDate * 1000)

      return (
        <span
          className="CampaignEndDate"
          data-toggle="tool-tip"
          data-placement="bottom"
          title={endDate.toString()}
        >
          {(this.state.timestamp > endDate) ? 'ended ' : 'ends '}
          <Moment from={this.state.timestamp} date={endDate.getTime()} />
        </span>
      )
    }
    return null
  }
}

export default CampaignEndDate
