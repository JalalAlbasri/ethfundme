import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Contribution extends Component {
  constructor(props, context) {
    super(props)
  }

  componentDidMount() {

  }

  render() {
    return (
      <div className="Contribution">
        {console.log('Contribution!')}
        <p> address: {this.props.contribution.address} </p>
        <p> amount: {this.props.contribution.amount} </p>
        <p> time: {new Date(this.props.contribution.time)} </p>
      </div>
    )
  }
}

Contribution.contextTypes = {
  drizzle: PropTypes.object
}

Contribution.propTypes = {
  contribution: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    contribution: state.campaigns[ownProps.campaignIndexd].contributions[ownProps.contributionIndex]
  }
}

const mapDispathToProps = (dispatch) => {
  return {
  }
}

export default drizzleConnect(Contribution, mapStateToProps, mapDispathToProps)
