import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import removeMd from 'remove-markdown';
import { Button, DropdownButton, FormControl, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { onboardingLink, truncSentence, truncWord } from 'config';
import { doubleRAF, getCollectionLink, truncate } from 'helpers/utils';

import { DeleteCollection, Upload } from 'containers';
import Modal from 'components/Modal';
import Capstone from 'components/collection/Capstone';
import EditModal from 'components/collection/EditModal';
import PublicSwitch from 'components/collection/PublicSwitch';
import { OnBoarding } from 'components/siteComponents';
import { ClipboardIcon, DatIcon, LoaderIcon, MoreIcon, PlusIcon, DownloadIcon } from 'components/icons';

import './style.scss';


class CollectionHeaderUI extends Component {

  static contextTypes = {
    canAdmin: PropTypes.bool,
    isAnon: PropTypes.bool,
    isMobile: PropTypes.bool
  };

  static propTypes = {
    auth: PropTypes.object,
    autoId: PropTypes.string,
    collection: PropTypes.object,
    collEdited: PropTypes.bool,
    collEditing: PropTypes.bool,
    collEditError: PropTypes.string,
    deleteColl: PropTypes.func,
    editCollection: PropTypes.func,
    history: PropTypes.object,
    shareToDat: PropTypes.func,
    stopAutomation: PropTypes.func,
    unshareFromDat: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      datShare: false,
      editModal: false,
      onBoarding: false
    };
  }

  downloadCollection = () => {
    const { collection } = this.props;
    window.location = `${getCollectionLink(collection)}/$download`;
  }

  copyDat = () => {
    this.datInput.select();
    document.execCommand('copy');
  }

  datHighlight = () => {
    const { collection } = this.props;
    if (collection.get('dat_share') && this.datInput) {
      // add 6 chars for dat:// prefix
      this.datInput.setSelectionRange(0, collection.get('dat_key').length + 6);
    }
  }

  datShare = () => {
    const { collection, shareToDat } = this.props;
    shareToDat(collection.get('owner'), collection.get('id'));
  }

  datUnshare = () => {
    const { collection, unshareFromDat } = this.props;
    unshareFromDat(collection.get('owner'), collection.get('id'));
  }

  editModal = () => {
    this.setState({ editModal: !this.state.editModal });
  }

  editCollection = (data) => {
    const { collection } = this.props;
    this.props.editCollection(collection.get('owner'), collection.get('id'), data);
  }

  manageCollection = () => {
    const { collection, history } = this.props;
    history.push(`${getCollectionLink(collection)}/management`);
  }

  newSession = () => {
    const { collection, history } = this.props;
    history.push(`${getCollectionLink(collection)}/$new`);
  }

  setPublic = (bool) => {
    const { collection } = this.props;
    this.props.editCollection(collection.get('owner'), collection.get('id'), { public: bool });
  }

  toggleDatModal = () => {
    this.setState({ datShare: !this.state.datShare });
  }

  showOnboarding = () => {
    this.setState({ onBoarding: true });
    doubleRAF(() => this.setState({ onBoarding: false }));
  }

  stopAutomation = () => {
    const { autoId, collection } = this.props;
    this.props.stopAutomation(collection.get('owner'), collection.get('id'), autoId);
  }

  togglePublicView = () => {
    const { collection, history } = this.props;
    history.push(getCollectionLink(collection));
  }

  render() {
    const { canAdmin, isAnon } = this.context;
    const { collection } = this.props;
    const { onBoarding } = this.state;

    const containerClasses = classNames('wr-collection-header');
    const isPublic = collection.get('public');
    const collTitle = collection.get('title');

    const titleCapped = truncate(collTitle, 9, truncWord);
    const allowDat = JSON.parse(process.env.ALLOW_DAT);

    const newFeatures = canAdmin && ['admin', 'beta-archivist'].includes(this.props.auth.get('role'));

    return (
      <header className={containerClasses}>
        {
          onboardingLink && !this.context.isMobile &&
            <OnBoarding open={onBoarding} />
        }
        {
          canAdmin &&
            <EditModal
              closeCb={this.editModal}
              desc={collection.get('desc')}
              editing={this.props.collEditing}
              edited={this.props.collEdited}
              editCallback={this.editCollection}
              error={this.props.collEditError}
              key={collection.get('id')}
              label="Collection"
              name={collection.get('title')}
              open={this.state.editModal}
              readOnlyName={this.context.isAnon} />
        }
        <div className="overview" key="collOverview">
          <div className={classNames('heading-row', { 'is-public': !canAdmin })}>
            <Capstone user={collection.get('owner')} />
            <h1
              className={classNames({ 'click-highlight': canAdmin })}
              onClick={canAdmin ? this.editModal : undefined}
              role={canAdmin ? 'button' : 'presentation'}
              title={collection.get('title')}>
              {titleCapped}
            </h1>
          </div>

          {
              <div className="menu-row">
                <Button className="rounded new-session" onClick={this.downloadCollection}><DownloadIcon /><span className="hidden-xs"> Download</span></Button>
              </div>
          }
        </div>
      </header>
    );
  }
}


export default CollectionHeaderUI;
