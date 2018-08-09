import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Contribute extends Component {
  constructor(props, context) {
    super(props)

    this.state = {
      contribution: 1
    }

    this.handleChangeContribution = this.handleChangeContribution.bind(this)
    this.handleContribute = this.handleContribute.bind(this)
  }

  handleChangeContribution(event) {
    this.setState({
      contribution: event.target.value
    })
    event.preventDefault()
  }

  handleContribute(event) {
    console.log('handle contribute')
    event.preventDefault()
  }

  render() {
    // TODO: Only non admin
    if (this.props.campaign.campaignState === 1) {
      return (
        <div className="Contribute container mb-3">
          <form>
            <div className="form-row">
              <div className="col-sm-1">
                <input
                    type="number"
                    className="form-control"
                    placeholder="Contribution"
                    value={this.state.contribution}
                    onChange={this.handleChangeContribution}
                  />
              </div>
              <div className="col-sm-1">
                <button type="submit" className="btn btn-outline-success" onClick={this.handleContribute}>
                  <FontAwesomeIcon className="button-icon" icon="gift" />
                  Contribute
                </button>
              </div>
            </div>
          </form>
        </div>
      )
    }
    return null
  }
}

Contribute.contextTypes = {
  drizzle: PropTypes.object
}

Contribute.propTypes = {
  campaign: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    campaign: state.campaigns[ownProps.campaignIndex]
  }
}

const mapDispathToProps = (dispatch) => {
  return {
  }
}

export default drizzleConnect(Contribute, mapStateToProps, mapDispathToProps)
