import React, { Component } from 'react'
import history from '../history'

// UI-Components
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'

class Header extends Component {

  render() {
    return (
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand bsSize="large">
            <a href="#" onClick={() => history.push('/')}>Ticket system</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullLeft>
          {this.props.account.accountRegistered ?
            <NavItem onSelect={() => history.push('/create')}>
              Create ticket
            </NavItem>
          :
            <NavItem onSelect={e => this.props.registerAccount(e)}>
              Register account
            </NavItem>
          }
          </Nav>
          <Nav pullRight>
            <NavItem>
              <span>
                <span className="App-account"> {this.props.account.address} ({this.props.account.accountRegistered ? 'registered' : 'not registered'})</span>
              </span>
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default Header
