import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  Col,
  Form,
  FormGroup,
  FormControl,
  Row,
} from "react-bootstrap";
import { guestSessionTimeout, product, userRegex } from "config";
import ReactTooltip from "react-tooltip";
import { login } from "helpers/userMessaging";

import { anonDisabled, homepageAnnouncement, supporterPortal } from "config";

import { StandaloneRecorder } from "containers";
import RedirectWithStatus from "components/RedirectWithStatus";
import {
  HomepageAnnouncement,
  // HomepageMessage,
} from "components/siteComponents";

import "./style.scss";

class HomeUI extends PureComponent {
  static propTypes = {
    auth: PropTypes.object,
    collections: PropTypes.array,
    history: PropTypes.object,
    showModalCB: PropTypes.func,
    anonCTA: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      formError: false,
      moveTemp: true,
      toColl: "New Collection",
      remember_me: false,
      username: "",
      password: "",
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.auth.get("loggingIn") && !nextProps.auth.get("loggingIn")) {
      if (!nextProps.auth.get("loginError")) {
        //this.closeLogin();
        if (this.state.formError) {
          this.setState({ formError: false });
        }

        const next =
          this.props.next !== null
            ? this.props.next
            : `/${nextProps.auth.getIn(["user", "username"])}`;
        if (next.startsWith("http")) {
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
    if (evt.target.type === "radio") {
      this.setState({ [evt.target.name]: evt.target.value === "yes" });
    } else {
      this.setState({ [evt.target.name]: evt.target.value });
    }
  };

  goToSupporterSite = () => {
    window.location.href = supporterPortal;
  };

  desktopApp = () => {
    window.location.href =
      "https://github.com/webrecorder/webrecorder-desktop/releases/latest";
  };

  github = () => {
    window.location.href = "https://github.com/webrecorder/";
  };

  login = () => {
    this.props.showModalCB();
  };

  playerApp = () => {
    window.location.href =
      "https://github.com/webrecorder/webrecorder-player/releases/latest";
  };

  rebuildTooltip = () => {
    ReactTooltip.rebuild();
  };

  save = (evt) => {
    evt.preventDefault();
    const { auth } = this.props;
    const { moveTemp, password, toColl, username } = this.state;

    let data = { username, password };

    if (this.state.remember_me) {
      data.remember_me = "1";
    }

    // check for anon usage
    if (
      auth.getIn(["user", "anon"]) &&
      auth.getIn(["user", "num_collections"]) > 0
    ) {
      data = { ...data, moveTemp, toColl };
    }

    this.props.loginFn(data);
  };

  validateUsername = () => {
    const pattern = userRegex;
    if (typeof this.state.username !== "undefined") {
      return this.state.username.match(pattern) === this.state.username
        ? null
        : "warning";
    }
    return null;
  };

  render() {
    const { anonCTA, auth, showModalCB, closeLogin } = this.props;
    const { moveTemp, password, toColl, username, formError } = this.state;

    const user = auth.get("user");

    if (__DESKTOP__ || !user.get("anon")) {
      return (
        <RedirectWithStatus to={`/${user.get("username")}`} status={302} />
      );
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>Homepage</title>
        </Helmet>

        {/* new login screen */}
        <div style={{margin: "0 -15px"}}> {/*get rid of 15px margin from wr-content*/}
          <h2 className="card-header text-center">
            <img
              src={require("shared/images/homepage/hd_logo_standard_16cm_rgb.png")}
              className="img-fluid"
              title="UNIVERSITÄT HEIDELBERG"
              alt="UNIVERSITÄT HEIDELBERG"
            />
          </h2>
          <div className="card-body mx-auto col-sm-10 col-md-8 col-lg-6">
            <Row className="m-3">
              {(anonCTA && login[auth.get("loginError")]) || (
                <div className="card-title" style={{padding: "0"}}>
                  <h3>Is this your first time here?</h3>
                  <h5>Please <a href="#">register</a> first.</h5>
                  <br />
                  <h3>Already registered?</h3>
                  <h5>Please log in with your Uni-ID (e.g. jb007).</h5>
                </div>
              )}
              {formError && (
                <Alert variant="danger">
                  {<span>Invalid login. Please try again.</span>}
                </Alert>
              )}
            </Row>
            <Row className="m-3">
              <Form id="loginform" className="col" style={{padding: "0"}} onSubmit={this.save}>
                <FormGroup key="username">
                  <label htmlFor="username" className="sr-only">
                    Username
                  </label>
                  <FormControl
                    aria-label="username"
                    onChange={this.handleChange}
                    value={username}
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    placeholder="Username"
                    required
                    autoFocus
                  />
                  <div className="help-block with-errors" />
                </FormGroup>

                <FormGroup key="password">
                  <label htmlFor="inputPassword" className="sr-only">
                    Password
                  </label>
                  <FormControl
                    aria-label="password"
                    onChange={this.handleChange}
                    value={password}
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Password"
                    required
                  />
                </FormGroup>

                <FormGroup key="remember">
                  <input
                    onChange={this.handleChange}
                    type="checkbox"
                    id="remember_me"
                    name="remember_me"
                    style={{marginRight: "10px"}}
                  />
                  <label htmlFor="remember_me">Remember me (Cookies must be enabled.)</label>
                </FormGroup>

                <Button bsSize="lg" bsStyle="primary" type="submit" block>
                  Sign in
                </Button>
              </Form>
            </Row>
          </div>
        </div>
        <ReactTooltip
          className="extraClass"
          delayHide={100}
          effect="solid"
          type="info"
        />
      </React.Fragment>
    );
  }
}

export default HomeUI;
