import React from 'react'

const Navbar = () => {
  return (
    // TODO: Collapse the navbars properly when mobile/ sm
    <nav className="navbar">
        <a className="navbar-brand mx-auto d-flex justify-content-center" href="/">
          <img src="../../public/logo.svg"/>
          <span className="logo"><span className="eth">eth</span><span className="fund">fund</span><span className="me">me</span></span>
        </a>
    </nav>
  )
}

export default Navbar
