import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import Contribution from './Contribution'

class Contributions extends Component {
  constructor(props, context) {
    super(props)
  }

  render() {
    return (
      <div className="Contributions container">
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">From</th>
              <th scope="col" className="center">
                Amount
              </th>
              <th scope="col" className="center">
                Date
              </th>
              <th scope="col" className="center">
                Withdrawn
              </th>
            </tr>
          </thead>
          <tbody>
            {this.props.campaign.contributions.map((contribution, contributionIndex) => (
              <Contribution
                key={contributionIndex}
                contribution={contribution}
                contributionIndex={contributionIndex}
                campaignState={this.props.campaign.campaignState}
                hasWithdrawn={this.props.campaign.hasWithdrawn}
              />
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

Contributions.contextTypes = {
  drizzle: PropTypes.object
}

Contributions.propTypes = {
  campaign: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispathToProps = (dispatch) => {
  return {}
}

export default drizzleConnect(Contributions, mapStateToProps, mapDispathToProps)
