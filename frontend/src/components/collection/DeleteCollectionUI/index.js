import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Button, Form, HelpBlock } from 'react-bootstrap';

import { getCollectionLink } from 'helpers/utils';
import { collection as collectionErr } from 'helpers/userMessaging';

import Modal from 'components/Modal';
import { LoaderIcon } from 'components/icons';

import './style.scss';


class DeleteCollectionUI extends Component {
  static contextTypes = {
    isAnon: PropTypes.bool
  };

  static propTypes = {
    children: PropTypes.node,
    collection: PropTypes.object,
    deleting: PropTypes.bool,
    deleteColl: PropTypes.func,
    error: PropTypes.string,
    wrapper: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.handle = null;
    this.state = {
      confirmDelete: '',
      deleteModal: false,
      indicator: false
    };
  }

  componentWillUnmount() {
    clearTimeout(this.handle);
  }

  handleChange = evt => this.setState({ [evt.target.name]: evt.target.value })

  toggleDeleteModal = () => this.setState({ deleteModal: !this.state.deleteModal })

  deleteCollection = () => {
    const { collection, user } = this.props;
    const { confirmDelete } = this.state;

    if (this.validateConfirmDelete() === 'success' || this.context.isAnon) {
      this.handle = setTimeout(() => this.setState({ indicator: true }), 300);
      this.props.deleteColl(collection.get('owner'), collection.get('id'), user.get('anon'));
    }
  }

  validateConfirmDelete = (evt) => {
    const { collection } = this.props;
    const { confirmDelete } = this.state;

    if (!confirmDelete) {
      return null;
    }

    if (confirmDelete && collection.get('title').toLowerCase() !== confirmDelete.toLowerCase()) {
      return 'error';
    }

    return 'success';
  }

  render() {
    const { isAnon } = this.context;
    const { collection, deleting, error, wrapper } = this.props;

    const Wrapper = wrapper || Button;

    return (
      <React.Fragment>
        <Wrapper onClick={this.toggleDeleteModal}>
          {this.props.children}
        </Wrapper>
        <Modal
          visible={this.state.deleteModal}
          closeCb={this.toggleDeleteModal}
          dialogClassName="wr-delete-modal"
          header={<h4>Confirm Delete Collection</h4>}
          body={
            <React.Fragment>
            <Row className="mx-3 my-3">
              <p>Are you sure you want to delete the collection <b>{collection.get('title')}</b> ({getCollectionLink(collection)})?
              If you confirm, <b>all recordings will be permanently deleted</b>.
              Be sure to download the collection first if you would like to keep any data.</p>
              {
                !isAnon &&
                  <Form.Group validationState={this.validateConfirmDelete()}>
                    <Form.Label>Type the collection title to confirm:</Form.Label>
                    <Form.Control
                      autoFocus
                      disabled={deleting}
                      id="confirm-delete"
                      name="confirmDelete"
                      onChange={this.handleChange}
                      placeholder={collection.get('title')}
                      type="text"
                      value={this.state.confirmDelete} />
                  </Form.Group>
              }
              {
                error &&
                  <HelpBlock style={{ color: 'red' }}>{ collectionErr[error] || 'Error encountered' }</HelpBlock>
              }
              </Row>
              <Row className="mx-3 my-3">
              <Button onClick={!deleting ? this.toggleDeleteModal : undefined} disabled={deleting} style={{ marginRight: 5 }}>Cancel</Button>
              <Button onClick={!deleting ? this.deleteCollection : undefined} disabled={!isAnon && (deleting || this.validateConfirmDelete() !== 'success')} bsStyle="danger">
                {
                  deleting && this.state.indicator &&
                    <LoaderIcon />
                }
                <span>Confirm Delete</span>
              </Button>
              </Row>
            </React.Fragment>
          } />
      </React.Fragment>
    );
  }
}

export default DeleteCollectionUI;
