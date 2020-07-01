import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { Alert, Button, Col, Form, FormGroup, FormControl, Row } from 'react-bootstrap';
import { guestSessionTimeout, product, userRegex } from 'config';

import { login } from 'helpers/userMessaging';

import { anonDisabled, homepageAnnouncement, supporterPortal } from 'config';

import { StandaloneRecorder } from 'containers';
import RedirectWithStatus from 'components/RedirectWithStatus';
import { HomepageAnnouncement, HomepageMessage } from 'components/siteComponents';


import './style.scss';


class HomeUI extends PureComponent {

  static propTypes = {
    auth: PropTypes.object,
    collections: PropTypes.array,
    history: PropTypes.object,
    showModalCB: PropTypes.func,
    anonCTA: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      formError: false,
      moveTemp: true,
      toColl: 'New Collection',
      remember_me: false,
      username: '',
      password: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.auth.get('loggingIn') && !nextProps.auth.get('loggingIn')) {
      if (!nextProps.auth.get('loginError')) {
        //this.closeLogin();
        if (this.state.formError) {
          this.setState({ formError: false });
        }

        const next = this.props.next !== null ? this.props.next : `/${nextProps.auth.getIn(['user', 'username'])}`;
        if (next.startsWith('http')) {
          window.location.href = next;
        } else {
          this.props.history.push(next);
        }
      } else {
        this.setState({ formError: true });
      }
    }
  }


  handleChange = (evt) => {
    if (evt.target.type === 'radio') {
      this.setState({ [evt.target.name]: evt.target.value === 'yes' });
    } else {
      this.setState({ [evt.target.name]: evt.target.value });
    }
  }

  goToSupporterSite = () => {
    window.location.href = supporterPortal;
  }

  desktopApp = () => {
    window.location.href = 'https://github.com/webrecorder/webrecorder-desktop/releases/latest';
  }

  github = () => {
    window.location.href = 'https://github.com/webrecorder/';
  }

  login = () => {
    this.props.showModalCB();
  }

  playerApp = () => {
    window.location.href = 'https://github.com/webrecorder/webrecorder-player/releases/latest';
  }


  save = (evt) => {
    evt.preventDefault();
    const { auth } = this.props;
    const { moveTemp, password, toColl, username } = this.state;

    let data = { username, password };

    if (this.state.remember_me) {
      data.remember_me = '1';
    }

    // check for anon usage
    if (auth.getIn(['user', 'anon']) && auth.getIn(['user', 'num_collections']) > 0) {
      data = { ...data, moveTemp, toColl };
    }

    this.props.loginFn(data);
  }

  signup = () => {
    this.props.history.push('/_register');
  }

  validateUsername = () => {
    const pattern = userRegex;
    if (typeof this.state.username !== 'undefined') {
      return this.state.username.match(pattern) === this.state.username ? null : 'warning';
    }
    return null;
  }


  render() {
    const { anonCTA, auth, showModalCB, closeLogin, formError } = this.props;
    const { moveTemp, password, toColl, username } = this.state;

    const user = auth.get('user');

    if (__DESKTOP__ || !user.get('anon')) {
      return <RedirectWithStatus to={`/${user.get('username')}`} status={302} />;
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>Homepage</title>
        </Helmet>

        {
          !anonDisabled &&
          <div className="top-buffer">
            <StandaloneRecorder />
            <div className="top-buffer">
              {
                user.get('anon') && user.get('num_collections') > 0 &&
                  <HomepageMessage
                    auth={auth}
                    showModal={showModalCB} />
              }
            </div>
          </div>
        }

        {/* new login screen */}
                  <div className="col-xs-8 col-xs-offset-2">
                    <div className="card">
                      <h2 className="card-header text-center" >
                        <img src={require('shared/images/homepage/hd_logo_standard_16cm_rgb.png')} class="img-fluid" title="UNIVERSITÄT HEIDELBERG" alt="UNIVERSITÄT HEIDELBERG" />
                      </h2>
                      <div className="card-body">
                        <div className="row" style={{ justifyContent: 'center' }}>
                          <div className="col-md-5">
                          <Row className="wr-login-form">
                            {
                              anonCTA &&
                                login[auth.get('loginError')] || <h4>Please sign in to manage collections.</h4>
                            }
                            {
                              formError &&
                                <Alert bsStyle="danger">
                                  {
                                    <span>Invalid Login. Please Try Again</span>
                                  }
                                </Alert>
                            }
                            <Form id="loginform" onSubmit={this.save}>
                              <FormGroup
                                key="username">
                                <label htmlFor="username" className="sr-only">Username</label>
                                <FormControl aria-label="username" onChange={this.handleChange} value={username} type="text" id="username" name="username" className="form-control" placeholder="username" required autoFocus />
                                <div className="help-block with-errors" />
                              </FormGroup>

                              <FormGroup key="password">
                                <label htmlFor="inputPassword" className="sr-only">Password</label>
                                <FormControl aria-label="password" onChange={this.handleChange} value={password} type="password" id="password" name="password" className="form-control" placeholder="Password" required />
                              </FormGroup>

                              <FormGroup key="remember">
                                <input onChange={this.handleChange} type="checkbox" id="remember_me" name="remember_me" />
                                <label htmlFor="remember_me">Remember me</label>

                                <Link to="/_forgot" style={{ float: 'right' }}>Forgot password or username?</Link>
                              </FormGroup>
                              {
                                auth.getIn(['user', 'anon']) && auth.getIn(['user', 'num_collections']) > 0 &&
                                  <TempUsage
                                    handleInput={this.handleChange}
                                    moveTemp={moveTemp}
                                    toColl={toColl} />
                              }
                              <Button bsSize="lg" bsStyle="primary" type="submit" block>Sign in</Button>
                            </Form>
                          </Row>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

      </React.Fragment>
    );
  }
}


export default HomeUI;
