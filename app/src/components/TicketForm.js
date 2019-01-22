import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap'

class TicketForm extends Component {

  render() {
    return (
      <form onSubmit={this.props.onSubmit}>
        <FormGroup controlId="formControlTitle">
          <ControlLabel>Title</ControlLabel>
          <FormControl
            inputRef={val => this.props.handleTitleInput(val)}
            type="text"
            placeholder="title" />
        </FormGroup>
        <FormGroup controlId="formControlDescription">
          <ControlLabel>Description</ControlLabel>
          <FormControl
            inputRef={val => this.props.handleDescriptionInput(val)}
            componentClass="textarea"
            placeholder="Description" />
        </FormGroup>
        <FormGroup controlId="formControlAssignee">
          <ControlLabel>Assignee</ControlLabel>
          <FormControl
            inputRef={val => this.props.handleAssigneeInput(val)}
            componentClass="select"
            placeholder="select">
            <option value="select">select</option>
            {this.props.registeredAccounts.map(account =>
              <option value={account}>{account}</option>
            )}
          </FormControl>
        </FormGroup>
        <Button type="submit">Create</Button>
      </form>
    );
  }
}

export default TicketForm;
