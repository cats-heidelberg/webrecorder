import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Alert, Button, Col, Form, FormGroup, FormControl, Row } from 'react-bootstrap';

import { guestSessionTimeout, product, userRegex } from 'config';
import { login } from 'helpers/userMessaging';

import { TempUsage } from 'containers';


class ContactForm extends Component {
  static propTypes = {
    anonCTA: PropTypes.bool,
    auth: PropTypes.object,
    cb: PropTypes.func,
    error: PropTypes.bool,
    closeLogin: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: '', // maybe default to user email if logged in?
      subject: '',
      msg: '', // changing 'msg' into 'message' breaks stuff (can't input text in form)
    };
  }

  save = (evt) => {
    evt.preventDefault();
    const { auth,cb } = this.props;
    const { name, email, subject, msg } = this.state;

    let data = { name, email, subject, msg };
     this.props.cb(data); // do stuff with data
  }

  handleChange = (evt) => {
    if (evt.target.type === 'radio') {
      this.setState({ [evt.target.name]: evt.target.value === 'yes' });
    } else {
      this.setState({ [evt.target.name]: evt.target.value });
    }
  }

  render() {
    const { anonCTA, auth, closeLogin, error } = this.props;
    const { name, email, subject, msg } = this.state;

    return (
      <React.Fragment>
        <Row className="mx-1 my-3">
          <Form id="loginform" className="col-12" onSubmit={this.save}>
            <FormGroup
              key="username" controlId="formName">
              <label>Name:</label>
              <FormControl aria-label="name" onChange={this.handleChange} value={name} type="text" id="name" name="name" className="form-control" placeholder="Enter your name!" required autoFocus />
              <div className="help-block with-errors" />
            </FormGroup>

            <FormGroup key="email" controlId="formEmail">
              <label>E-mail:</label>
              <FormControl aria-label="email" onChange={this.handleChange} value={email} type="email" id="email" name="email" className="form-control" placeholder="name@example.com" required />
            </FormGroup>

            <FormGroup key="subject" controlId="formSubject">
              <label>Subject:</label>
              <FormControl aria-label="subject" onChange={this.handleChange} value={subject} type="text" id="subject" name="subject" className="form-control" placeholder="What do you need help with?" required />
            </FormGroup>

            <FormGroup key="message" controlId="formMessage">
              <label>Message:</label>
              <FormControl aria-label="message" onChange={this.handleChange} value={msg} type="text" id="msg" name="msg" className="form-control" placeholder="Please describe your issue." as="textarea" rows="5" required />
            </FormGroup>

            <Button bsSize="lg" bsStyle="primary" type="submit" block>Submit</Button>
          </Form>
        </Row>
      </React.Fragment>
    );
  }
}

export default ContactForm;
