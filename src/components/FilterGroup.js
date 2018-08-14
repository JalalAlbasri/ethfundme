import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import FilterButton from './FilterButton'

class FilterGroup extends Component {
  constructor(props, context) {
    super(props)
  }

  render() {
    return (
      <div className="FilterGroup btn-group-vertical mb-2">
        <FilterButton
          filter={{ name: this.props.filterGroup.name, isActive: this.props.filterGroup.isActive }}
        />

        {Object.prototype.hasOwnProperty.call(this.props.filterGroup, 'adminFilters')
        && this.props.account.isAdmin
          ? Object.keys(this.props.filterGroup.adminFilters).map((filterName) => (
              <FilterButton
                key={filterName}
                filter={{
                  ...this.props.filterGroup.adminFilters[filterName],
                  groupName: this.props.filterGroup.name,
                  adminOnly: true,
                  name: filterName
                }}
              />
          ))
          : null}
      </div>
    )
  }
}

FilterGroup.contextTypes = {
  drizzle: PropTypes.object
}

FilterGroup.propTypes = {
  account: PropTypes.object.isRequired,
  filterGroup: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account
  }
}

export default drizzleConnect(FilterGroup, mapStateToProps)
