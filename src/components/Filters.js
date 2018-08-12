import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { CAMPAIGN_STATES, APPROVAL_STATES } from './Campaign'

import FilterButton from './FilterButton'

class Filter extends Component {
  constructor(props, context) {
    super(props)
    this.handleFitlerChange = this.handleFitlerChange.bind(this)
    this.state = {
      filter: this.props.filter
    }
  }

  handleFitlerChange(event) {
    console.log(`handleFitlerChange(), this.state.filter: ${this.state.filter}`)
    this.setState({
      filter: event.target.filter
    })
    this.props.dispatchChangeFilter(event.target.filter)
    event.preventDefault()
  }

  render() {
    const adminFilters = null
    // if (this.props.isAdmin)

    return (
      <div className="Filters btn-group-vertical" role="group">
        {CAMPAIGN_STATES.map((campaignState, i) => <FilterButton
          key={campaignState}
          label={campaignState}
          filterIndex={i}
          />)}
      </div>
    )
  }
}

Filter.contextTypes = {
  drizzle: PropTypes.object
}

Filter.propTypes = {
}

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account
  }
}

export default drizzleConnect(Filter, mapStateToProps)
