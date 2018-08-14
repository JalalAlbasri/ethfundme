import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { setFilter } from '../actions/FilterActions'

import FilterBadge from './FilterBadge'

class FilterButton extends Component {
  constructor(props, context) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(event) {
    console.log(`handleClick, this.props.filter.adminOnly: ${this.props.filter.adminOnly}`)
    if (this.props.filter.adminOnly) {
      this.props.dispatchSetFilter(this.props.filter.groupName, this.props.filter.name)
    } else {
      this.props.dispatchSetFilter(this.props.filter.name)
    }

    event.preventDefault()
  }

  render() {
    return (
      <button
        type="button"
        className={
          'FilterButton d-flex btn align-items-center '
          + (this.props.filter.groupName ? this.props.filter.groupName : this.props.filter.name)
          + (this.props.filter.adminOnly ? ' adminFilter btn-sm ' : ' ')
          + (this.props.filter.isActive ? ' active' : '')
        }
        onClick={this.handleClick}>
        <span className="">{this.props.filter.name}</span>
        <FilterBadge groupName={this.props.filter.groupName} filterName={this.props.filter.name}/>
      </button>
    )
  }
}

FilterButton.contextTypes = {
  drizzle: PropTypes.object
}

FilterButton.propTypes = {
  filter: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchSetFilter: (filterName, adminFilterName) => {
      dispatch(setFilter(filterName, adminFilterName))
    }
  }
}

export default drizzleConnect(FilterButton, mapStateToProps, mapDispatchToProps)
