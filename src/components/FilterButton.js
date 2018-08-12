import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { toggleFilter } from '../actions/FilterActions'

import FilterBadge from './FilterBadge'

class FilterButton extends Component {
  constructor(props, context) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(event) {
    this.props.dispatchToggleFilter(this.props.filter.name)
    event.preventDefault()
  }

  render() {
    console.log(`this.props.filter.name: ${this.props.filter.name}`)
    return (
      <button
        type="button"
        className={
          'FilterButton d-flex btn align-items-center '
          + this.props.filter.name
          + ((this.props.filter.isActive) ? ' active' : '')
        }
        onClick={this.handleClick}>
        <span className="">{this.props.filter.name}</span>
        <FilterBadge filterName={this.props.filter.name}/>
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
    dispatchToggleFilter: (filterIndex) => {
      dispatch(toggleFilter(filterIndex))
    }
  }
}

export default drizzleConnect(FilterButton, mapStateToProps, mapDispatchToProps)
