import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { contribute } from '../actions/CampaignActions'

class Progress extends Component {
  constructor(props, context) {
    super(props)
  }

  render() {
    if (this.props.campaign.campaignState === 'Pending') {
      return null
    }

    let funds = this.props.campaign.totalRaised
    let goal = this.props.campaign.goal

    if (funds <= goal) {
      const progress = (funds / goal) * 100

      const progressBarStyle = {
        width: progress + '%'
      }

      return (
        <div className="GoalProgress">
          <p className="lead d-flex justify-content-center">
            {' '}
            {funds} eth raised of {goal} eth
          </p>
          <div className="progress">
            {/* <div className="progress-bar goal" */}
            <div
              className="progress-bar progress-bar-striped"
              role="progressbar"
              aria-valuemin="0"
              aria-valuenow={progress}
              aria-valuemax="100"
              style={progressBarStyle}
            >
              {funds > 0 ? funds : ''}
            </div>
          </div>
        </div>
      )
    }

    const goalProgress = (goal / funds) * 100
    const surplusProgress = ((funds - goal) / funds) * 100

    const goalProgressBarStyle = {
      width: goalProgress + '%'
    }

    const surplusProgressBarStyle = {
      width: surplusProgress + '%'
    }

    return (
      <div className="GoalProgress">
        <p className="lead d-flex justify-content-center">
          {' '}
          {funds} eth raised of {goal} eth
        </p>
        <div className="progress">
          {/* <div className="progress-bar goal" */}
          <div
            className="progress-bar progress-bar-striped"
            role="progressbar"
            aria-valuemin="0"
            aria-valuenow={goalProgress}
            aria-valuemax="100"
            style={goalProgressBarStyle}
          >
            {goal}
          </div>
          {/* <div className="progress-bar surplus" */}
          <div
            className="progress-bar progress-bar-striped bg-success"
            role="progressbar"
            aria-valuemin="0"
            aria-valuenow={surplusProgress}
            aria-valuemax="100"
            style={surplusProgressBarStyle}
          >
            {funds - goal}
          </div>
        </div>
      </div>
    )
  }
}

Progress.contextTypes = {
  drizzle: PropTypes.object
}

Progress.propTypes = {
  campaign: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispathToProps = (dispatch) => {
  return {}
}

export default drizzleConnect(Progress, mapStateToProps, mapDispathToProps)
