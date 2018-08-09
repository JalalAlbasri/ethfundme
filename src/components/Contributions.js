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
        {/* <p className="">Contributions</p> */}
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">From</th>
              <th scope="col" className="center">Amount</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.campaign.contributions.map((contribution, contributionIndex) => (
                <Contribution
                  key={contributionIndex}
                  campaignIndex={this.props.campaignIndex}
                  contributionIndex={contributionIndex}
                />
              ))
            }
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
  campaign: PropTypes.object.isRequired,
  campaignIndex: PropTypes.number.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    campaign: state.campaigns[ownProps.campaignIndex],
    campaignIndex: ownProps.campaignIndex
  }
}

const mapDispathToProps = (dispatch) => {
  return {
  }
}

export default drizzleConnect(Contributions, mapStateToProps, mapDispathToProps)
