import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import FilterButton from './FilterButton'

class Filters extends Component {
  constructor(props, context) {
    super(props)
    this.handleFitlerChange = this.handleFitlerChange.bind(this)
    this.state = {
      filter: this.props.filter
    }
  }

  handleFitlerChange(event) {
    this.setState({
      filter: event.target.filter
    })
    this.props.dispatchChangeFilter(event.target.filter)
    event.preventDefault()
  }

  render() {
    let filters = (this.props.account.isAdmin) ? this.props.filters : this.props.filters.slice(4)

    return (
      <div className="Filters btn-group-vertical" role="group">
        {filters.map((filter) => <FilterButton
          key={filter.name}
          filter={filter}
          />)}
      </div>
    )
  }
}

Filters.contextTypes = {
  drizzle: PropTypes.object
}

Filters.propTypes = {
  filters: PropTypes.array.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account,
    filters: state.filters
  }
}

export default drizzleConnect(Filters, mapStateToProps)
