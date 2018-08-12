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
              <th scope="col" className="center">Amount</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.contributions.map((contribution, contributionIndex) => (
                <Contribution
                  key={contributionIndex}
                  contribution={contribution}
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
  contributions: PropTypes.array.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispathToProps = (dispatch) => {
  return {
  }
}

export default drizzleConnect(Contributions, mapStateToProps, mapDispathToProps)
