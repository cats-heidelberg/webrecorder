import React, { Component } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import classNames from "classnames";
import { fromJS } from "immutable";
import { Button, Col, Row } from "react-bootstrap";

import { apiFetch, stopPropagation } from "helpers/utils";
import { appHost } from "config";

import { StandaloneRecorder } from "containers";

import HttpStatus from "components/HttpStatus";
import InlineEditor from "components/InlineEditor";
import RedirectWithStatus from "components/RedirectWithStatus";
import WYSIWYG from "components/WYSIWYG";
import { Upload } from "containers";
import { LinkIcon, UploadIcon } from "components/icons";

import CollectionItem from "./CollectionItem";
import "./style.scss";

class ReviewUI extends Component {
  static contextTypes = {
    isAnon: PropTypes.bool,
  };

  static propTypes = {
    activeBrowser: PropTypes.string,
    auth: PropTypes.object,
    completeReview: PropTypes.func,
    collections: PropTypes.object,
    editCollection: PropTypes.func,
    edited: PropTypes.bool,
    onPatch: PropTypes.func,
    match: PropTypes.object,
    orderedCollections: PropTypes.object,
    match: PropTypes.object,
    history: PropTypes.object,
    timestamp: PropTypes.string,
    user: PropTypes.object,
  };

  static defaultProps = fromJS({
    collections: [],
  });

  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      showModalFinish: false,
    };
  }

  completeReview = (collID, user, ticketState) => {
    const { completeReview } = this.props;
    completeReview(user, collID, ticketState);
  };

  toggle = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  close = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { isAnon } = this.context;
    const {
      auth,
      collections,
      history,
      orderedCollections,
      match: { params },
      user,
    } = this.props;
    const { showModal, showModalFinish } = this.state;
    const userParam = params.user;
    const displayName = user.get("full_name") || userParam;
    const canAdmin = auth.getIn(["user", "username"]) === userParam;

    const userLink =
      user.get("display_url") &&
      (!user.get("display_url").match(/^[a-zA-Z]+:\/\//)
        ? `http://${user.get("display_url")}`
        : user.get("display_url"));

    if (collections.get("error") && !collections.get("creatingCollection")) {
      console.log(collections.getIn(["error", "error_message"]));
      return (
        <HttpStatus>{collections.getIn(["error", "error_message"])}</HttpStatus>
      );
    }

    if (collections.get("loaded") && isAnon && canAdmin) {
      return (
        <RedirectWithStatus
          to={`/${auth.getIn(["user", "username"])}/temp/manage`}
          status={301}
        />
      );
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>{`${displayName}'s Collections`}</title>
        </Helmet>
        <Row>
          <Col
            xs={15}
            sm={__DESKTOP__ ? 10 : 9}
            smOffset={__DESKTOP__ ? 2 : 2}
            className="wr-coll-meta"
          >
            {isAnon ||
              (auth.getIn(["user", "role"]) !== "admin" && (
                <Row>
                  <Col
                    xs={15}
                    className={classNames("collections-index-nav", {
                      desktop: __DESKTOP__,
                    })}
                  >
                    {__DESKTOP__ && (
                      <h4>please log in as an admin to review data</h4>
                    )}
                  </Col>
                </Row>
              ))}
            {!isAnon && auth.getIn(["user", "role"]) === "admin" && (
              <Row>
                <Col
                  xs={15}
                  className={classNames("collections-index-nav", {
                    desktop: __DESKTOP__,
                  })}
                >
                  {__DESKTOP__ && <h4>To be reviewed:</h4>}
                </Col>
              </Row>
            )}
            {collections &&
              collections.get("loaded") &&
              auth.getIn(["user", "role"]) === "admin" && (
                <Row>
                  <ul className="list-group collection-list">
                    {orderedCollections.map((coll) => {
                      return (
                        <CollectionItem
                          key={coll.get("id")}
                          canAdmin={canAdmin}
                          collection={coll}
                          collUser={user}
                          completeReview={this.completeReview}
                          error={collections.get("error")}
                          history={history}
                          onPatch={() => {}}
                        />
                      );
                    })}
                  </ul>
                </Row>
              )}
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default ReviewUI;
