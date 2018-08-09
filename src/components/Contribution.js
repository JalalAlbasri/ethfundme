import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

class Contribution extends Component {
  constructor(props, context) {
    super(props)
  }

  componentDidMount() {

  }

  render() {
    const time = new Date(this.props.contribution.time)
    return (
      <tr className="Contribution">
        <th scope="row">{this.props.contributionIndex + 1}</th>
        <td>{this.props.contribution.address}</td>
        <td className="center">{this.props.contribution.amount}</td>
        {/* <td>{time.toString()}</td> */}
      </tr>
    )
  }
}

Contribution.contextTypes = {
  drizzle: PropTypes.object
}

Contribution.propTypes = {
  contribution: PropTypes.object.isRequired,
  contributionIndex: PropTypes.number.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    contribution: state.campaigns[ownProps.campaignIndex].contributions[ownProps.contributionIndex],
    contributionIndex: ownProps.contributionIndex
  }
}

const mapDispathToProps = (dispatch) => {
  return {
  }
}

export default drizzleConnect(Contribution, mapStateToProps, mapDispathToProps)
