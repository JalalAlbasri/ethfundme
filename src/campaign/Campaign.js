import React, { Component } from 'react'
import PropTypes from 'prop-types'

const Campaign = ({address}) => (
  <li>
    {address}
  </li>
)

Campaign.propTypes = {
  address: PropTypes.string.isRequired
}

export default Campaign
