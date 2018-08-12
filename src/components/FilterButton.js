import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { toggleFilter } from '../actions/FilterActions'

class FilterButton extends Component {
  constructor(props, context) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(event) {
    this.props.dispatchToggleFilter(this.props.filterIndex)
    event.preventDefault()
  }

  render() {
    console.log(`this.props.filterState: ${this.props.filterState}`)
    return (
      <button
        type="button"
        className={'FilterButton btn ' + this.props.filterState + ' filterIndex' + this.props.filterIndex}
        onClick={this.handleClick}>
        {this.props.label}
      </button>
    )
  }
}

FilterButton.contextTypes = {
  drizzle: PropTypes.object
}

FilterButton.propTypes = {
  filterIndex: PropTypes.number.isRequired,
  filterState: PropTypes.bool.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    filterState: state.filter[ownProps.filterIndex]
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
