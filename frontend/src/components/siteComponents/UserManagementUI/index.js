import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { DropdownButton, Dropdown } from "react-bootstrap";

import { product, supporterPortal } from "config";

import { BugReport } from "containers";

import Modal from "components/Modal";
import SizeFormat from "components/SizeFormat";
import { UserIcon } from "components/icons";

import config from "config";

import LoginForm from "./loginForm";
import ContactForm from "./contactForm";
import "./style.scss";

let shell;
if (__DESKTOP__) {
  shell = window.require("electron").shell; // eslint-disable-line
}

class UserManagementUI extends PureComponent {
  static propTypes = {
    anonCTA: PropTypes.bool,
    auth: PropTypes.object,
    canAdmin: PropTypes.bool,
    history: PropTypes.object,
    loadAuth: PropTypes.func,
    loginFn: PropTypes.func.isRequired,
    next: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    open: PropTypes.bool,
    reportModal: PropTypes.bool,
    route: PropTypes.object,
    sendContactProp: PropTypes.func,
    showModal: PropTypes.func,
    toggleBugModal: PropTypes.func,
  };

  constructor(options) {
    super(options);

    this.state = {
      formError: null,
      contactVisible: false,
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

  showLogin = () => {
    this.props.showModal(true);
  };

  closeLogin = () => {
    this.props.showModal(false);
    this.setState({ formError: false });
  };

  showContactForm = () => {
    this.setState({ contactVisible: true });
  };

  closeContactForm = () => {
    this.setState({ contactVisible: false });
  };

  toggleContactForm = () => {
    this.setState({ contactVisible: !this.state.contactVisible });
  };

  goToCollections = () => {
    const { auth, history } = this.props;
    history.push(`/${auth.getIn(["user", "username"])}`);
  };

  goToFAQ = () => {
    this.props.history.push("/_faq");
  };

  goToLogout = () => {
    this.props.history.push("/_logout");
  };

  // goToSignup = () => {
  //   this.props.history.push("/_register");
  // };

  // goToUserGuide = () => {
  //   this.props.history.push("/_guide");
  // };

  openDesktopHelp = (evt) => {
    evt.preventDefault();
    shell.openExternal(
      "https://github.com/webrecorder/webrecorder-desktop#webrecorder-desktop-app"
    );
  };

  openReview = (evt) => {
    evt.preventDefault();
    const { auth } = this.props;
    const user = auth.get("user");
    const username = user.get("username");
    window.location.href = `${config.appHost}/${username}/review`;
  };

  save = (data) => {
    this.setState({ formError: false });
    this.props.loginFn(data);
  };
  //add some other options
  sendContact = (data) => {
    switch (data.subject) {
      case "signUp":
        this.props.cb(data);
        break;
      case "general":
        this.props.sendContactProp(data);
        break;  
        
      default:
        this.props.cb(data);
        break;

    }
    
  }

  toggleBugModal = () => {
    const { route, reportModal } = this.props;
    const mode = /record|replay|extract|patch/.test(route.name) ? "dnlr" : "ui";
    this.props.toggleBugModal(reportModal !== null ? null : mode);
  };

  toggleDropdown = (isOpen) => {
    if (isOpen) {
      this.props.loadAuth();
    }
  };

  render() {
    const { anonCTA, auth, canAdmin, open } = this.props;
    const { formError, contactVisible } = this.state;

    const form = (
      <LoginForm
        anonCTA={anonCTA}
        auth={auth}
        cb={this.save}
        error={formError}
        closeLogin={this.closeLogin}
      />
    );
    const contactForm = <ContactForm cb={this.sendContact} closeContactForm={this.closeContactForm}/>;
    const collCount = auth.getIn(["user", "num_collections"]);
    const user = auth.get("user");
    const username = user.get("username");
    const isAnon = user.get("anon");

    const userDropdown = (
      <React.Fragment>
        <UserIcon dark={canAdmin} />
          <div className="username-btn">
           {isAnon ? "Temporary Account" : username}
          </div>
      </React.Fragment>
    );
    const usage =
      ((user.getIn(["space_utilization", "used"]) /
        user.getIn(["space_utilization", "total"])) *
        100 +
        0.5) |
      0;
    const hasCollections = !isAnon || (isAnon && collCount > 0);

    return (
      <React.Fragment>
        <ul className="navbar-user-links">
          <li>
            <Link to="/_faq">About</Link>
          </li>
          <li>
            <Link to="/_guide">Guide</Link>
          </li>
          {auth.getIn(["user", "role"]) === "admin" && (
            <li className="hidden-xs">

                <button
                  className="button-link"
                  onClick={this.openReview}
                  type="button"
                >
                  Review
                </button>

            </li>
          )}
          <li className="navbar-text">
            <button
              className="button-link"
              onClick={this.showContactForm}
              type="button"
            >
              Contact
            </button>
          </li>

          {supporterPortal && (
            <li className="hidden-xs">
              <a href={supporterPortal} target="_blank">
                {user.get("customer_id") ? "Manage Support" : "Support Us"}
              </a>
            </li>
          )}

          {!auth.get("loaded") || !username || (isAnon && collCount === 0) ? (
            <React.Fragment>
              <li>
                <button
                  className="rounded login-link"
                  onClick={this.showLogin}
                  type="button"
                >
                  Login
                </button>
              </li>
            </React.Fragment>
          ) : (
            <li className="navbar-text">
              <DropdownButton
                pullRight
                id="user-dropdown"
                title={userDropdown}
                onToggle={this.toggleDropdown}
              >
                {!__DESKTOP__ && (
                  <li className="display login-display">
                    <span className="sm-label">
                      {isAnon ? "Active as" : "Signed in as"}
                    </span>
                    <h5>{user.get("full_name") || username}</h5>
                    <span className="username">
                      <span className="glyphicon glyphicon-user right-buffer-sm" />
                      {username}
                    </span>
                  </li>
                )}

                {hasCollections && (
                  <Dropdown.Item onClick={this.goToCollections}>
                    Your Collections
                    <span className="num-collection">{collCount}</span>
                  </Dropdown.Item>
                )}
                {hasCollections && (
                  <li className="display">
                    <span className="sm-label space-usage">
                      Space Used: {usage}% of{" "}
                      {
                        <SizeFormat
                          bytes={user.getIn(["space_utilization", "total"])}
                        />
                      }
                    </span>
                    <div className="space-display">
                      <span style={{ width: `${usage}%` }} />
                    </div>
                  </li>
                )}

                {__DESKTOP__ && <Dropdown.Item divider />}

                {!__DESKTOP__ && (
                  <React.Fragment>
                    <Dropdown.Item divider />
                    <Dropdown.Item onClick={this.goToFAQ}>
                      About Webrecorder
                    </Dropdown.Item>
                  </React.Fragment>
                )}

                {!isAnon && !__DESKTOP__ && (
                  <React.Fragment>
                    <Dropdown.Item divider />
                    <Dropdown.Item onClick={this.goToLogout}>
                      <span
                        className="glyphicon glyphicon-log-out"
                        title="Logout"
                      />{" "}
                      Logout
                    </Dropdown.Item>
                  </React.Fragment>
                )}
              </DropdownButton>
            </li>
          )}
        </ul>

        <Modal
          dialogClassName="wr-login-modal"
          header="Contact Us!"
          body={contactForm}
          visible={contactVisible}
          closeCb={this.closeContactForm}
        />

        <Modal
          dialogClassName="wr-login-modal"
          header={anonCTA ? null : `Webrecorder Login`}
          body={form}
          visible={open}
          closeCb={this.closeLogin}
        />

        <BugReport route={this.props.route} />
      </React.Fragment>
    );
  }
}

export default UserManagementUI;
