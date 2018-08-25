import React from 'react'

import Account from './Account'

import logo from '../../public/logo.svg'

const Navbar = () => {
  return (
    <nav className="navbar fixed-top">
      <a className="navbar-brand mr-auto d-flex justify-content-center" href="/">
        <img src={logo} />
        <span className="logo">
          <span className="eth">eth</span>
          <span className="fund">fund</span>
          <span className="me">me</span>
        </span>
      </a>
      {/* <Account /> */}
    </nav>
  )
}

export default Navbar
