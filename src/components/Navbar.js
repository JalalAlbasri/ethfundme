import React from 'react'

import Account from './Account'

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-md">
      <div className="w-50 d-flex justify-content-start" />
      <a className="navbar-brand d-flex mx-auto justify-content-center" href="/">
        <img src="../../public/logo.svg"/>
        <span className="logo"><span className="eth">eth</span><span className="fund">fund</span><span className="me">me</span></span>
      </a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="w-50 d-flex justify-content-end">
        <Account />
      </div>
    </nav>
  )
}

export default Navbar
