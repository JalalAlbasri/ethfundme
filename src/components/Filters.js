import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import FilterGroup from './FilterGroup'

class Filters extends Component {
  constructor(props, context) {
    super(props)
  }

  render() {
    return (
      <div className="Filters" role="group">
        {Object.keys(this.props.filters).map((filterKey) => (
          <FilterGroup
            key={filterKey}
            filterGroup={{ ...this.props.filters[filterKey], name: filterKey }}
          />
        ))}

      </div>
    )
  }
}

Filters.contextTypes = {
  drizzle: PropTypes.object
}

Filters.propTypes = {
  account: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account,
    filters: state.filters
  }
}

export default drizzleConnect(Filters, mapStateToProps)
