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
    reviewing: PropTypes.bool,
    loadReviewCollections: PropTypes.func,
    onPatch: PropTypes.func,
    match: PropTypes.object,
    numCollections: PropTypes.number,
    orderedCollections: PropTypes.object,
    history: PropTypes.object,
    Reviewed: PropTypes.func,
    sortByReview: PropTypes.object,
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
      _sortBy: this.props.sortByReview,
      numCollections: 0,
      showModalFinish: false,
    };
  }

  componentDidMount() {
    const { getCollectionsReview, collections, sortCollections } = this.props;
    const { _sortBy } = this.state;
    getCollectionsReview(collections.get("collections"), _sortBy);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.sortByReview !== this.props.sortByReview) {
      this.setState({ _sortBy: this.props.sortByReview });
    }
  }

  completeReview = (user, collID, ticketState, doi, url) => {
    const { completeReview } = this.props;
    console.log("rewiew/index/76/"+doi);
    completeReview(user, collID, ticketState, doi, url);
  };

  Reviewed = (user, collID, ticketState) => {
    const { Reviewed } = this.props;
    console.log("REVIEWED"+collID);
    Reviewed(user, collID, ticketState);
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
    const { collectionsReview, showModal, showModalFinish } = this.state;
    const userParam = params.user;

    let headlinelast = "";
    let headline = "";
    
    const displayName = user.get("full_name") || userParam;
    const canAdmin = auth.getIn(["user", "role"]) === "admin";

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

    return (
      <React.Fragment>
        <Helmet>
          <title>{`${displayName}'s Collections`}</title>
        </Helmet>
        <Row>
          <Col className="mx-auto col-sm-10 col-lg-8">
            {/*(isAnon || !canAdmin) && (
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
            )*/}
            {/*!isAnon && canAdmin && (
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
            )*/}
            {collections && collections.get("loaded") && canAdmin && (
              <Row className="my-5">
                <ul className="collection-list mt-3 pl-0">
                  {collections.get("collections").map((coll) => {
                          const temp =
                            coll.get("ticketState") !== headline &&
                            coll.get("ticketState") !== headlinelast
                              ? coll.get("ticketState")
                              : headline !== headlinelast &&
                                coll.get("ticketState") !== headline &&
                                coll.get("ticketState") === headlinelast
                              ? coll.get("ticketState")
                              : "";
                          coll.get("ticketState") !== headline
                            ? (headline = coll.get("ticketState"))
                            : headline !== headlinelast
                            ? (headlinelast = headline)
                            : null;

                          return (
                            <CollectionItem
                              key={coll.get("id")}
                              canAdmin={canAdmin}
                              collection={coll}
                              collUser={user}
                              completeReview={this.completeReview}
                              duplicateCollection={this.duplicateCollection}
                              editCollection={this.editColl}
                              completeRec={this.completeRec}
                              Reviewed={this.Reviewed}
                              error={collections.get("error")}
                              history={history}
                              onPatch={this.onPatch}
                              headline={temp}
                              ticketState={coll.get("ticketState")}
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
