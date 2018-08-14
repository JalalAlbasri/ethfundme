import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import Moment from 'react-moment'

class Contribution extends Component {
  constructor(props, context) {
    super(props)
    this.state = {
      timestamp: 0
    }
  }

  componentDidMount() {
    web3.eth.getBlock('latest', (err, block) => {
      this.setState({
        timestamp: new Date(block.timestamp * 1000)
      })
    })
  }

  render() {
    const time = new Date(this.props.contribution.time * 1000)
    return (
      <tr className="Contribution">
        <th scope="row">{this.props.contributionIndex + 1}</th>
        <td>{this.props.contribution.address}</td>
        <td className="center">{this.props.contribution.amount}</td>
        <td className="center">
          <Moment from={this.state.timestamp} date={time} />
        </td>
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
  return {}
}

const mapDispathToProps = (dispatch) => {
  return {}
}

export default drizzleConnect(Contribution, mapStateToProps, mapDispathToProps)
