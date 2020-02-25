import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import removeMd from 'remove-markdown';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Button, Col, Row, Tooltip } from 'react-bootstrap';
import { CheckIcon } from 'components/icons';

import { buildDate, getCollectionLink, truncate } from 'helpers/utils';

import SizeFormat from 'components/SizeFormat';
import Modal from 'components/Modal';

import { EditMetadata } from 'components/siteComponents';
import { DeleteCollection } from 'containers';
import { TrashIcon, PlusIcon } from 'components/icons';

class CollectionItem extends PureComponent {
  static propTypes = {
    closeFinish: PropTypes.func,
    canAdmin: PropTypes.bool,
    addToList: PropTypes.func,
    collId: PropTypes.string,
    collUser: PropTypes.string,
    toggleFinish: PropTypes.func,
    editCollection: PropTypes.func,
    error: PropTypes.string,
    id: PropTypes.string,
    isOver: PropTypes.bool,
    collection: PropTypes.object,
    selected: PropTypes.bool,
    history: PropTypes.string,
    visible: PropTypes.bool
  };



  closeModal = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    this.props.toggleFinish();
  }
  newSession = () => {
    const { collection, history } = this.props;
    history.push(`${getCollectionLink(collection)}/$new`);
  }
  sendArchive = () => {
    const { collection, history } = this.props;
    history.push('/_warcsent');
  }
  toggleVisibility = () => {
    const { collection } = this.props;
    this.props.editCollection(collection.get('owner'), collection.get('id'), { public: !collection.get('public') });
  }

  render() {
    
    const { canAdmin, collection, closeFinish, visible } = this.props;
    const descClasses = classNames('left-buffer list-group-item', { 'has-description': collection.get('desc') });

    return (
      <React.Fragment>
      <li className={descClasses} key={collection.get('id')}>
        <Row>
          <Col sm={12} md={7}>
            <Link className="collection-title" to={`${getCollectionLink(collection)}`}>{collection.get('title')}</Link>
            <p className="collection-list-description">
              {
                truncate(removeMd(collection.get('desc'), { useImgAltText: false }), 3, new RegExp(/([.!?])/))
              }
            </p>
            {
              canAdmin &&
                <React.Fragment>
                  <Button className="rounded" onClick={this.newSession}><PlusIcon />Edit and Complete</Button>
                  <Button className="rounded new-session" onClick={this.closeModal}><CheckIcon /><span className="hidden-xs"> Edit Metadata</span></Button>
                  {
              //allowDat &&
              /*<Modal
                visible={visible}
                closeCb={closeFinish}
                header="To finish recording please confirm."
                dialogClassName="table-header-modal dat-modal">
                {


                    <React.Fragment>
                      <h4>Attention</h4>
                      <p>If you submit your archive for DOI creation you won't be able to record more content.<br /> <br />End recording archive? <a href="https://datproject.org/" target="_blank">Learn more</a></p>
                      <Button className="rounded new-session" onClick={this.sendArchive}><CheckIcon /><span className="hidden-xs">I am sure.</span></Button>

                    </React.Fragment>
                }
                <Button onClick={this.closeModal} className="rectangular">Close</Button>
              </Modal>*/
            }
                </React.Fragment>
            }
          </Col>
          <Col xs={6} md={1} className="collection-list-size">
            <SizeFormat bytes={collection.get('size')} />
          </Col>
          <Col className="collection-time" xs={6} md={2}>
            Created {buildDate(collection.get('created_at'), false, true)}
          </Col>
          <Col className="collection-delete-action col-xs-offset-7 col-md-offset-0" xs={5} md={2}>
            {
              canAdmin &&
                <React.Fragment>
                  {
                    !__DESKTOP__ &&
                      <span className={classNames('visibility-button', { 'is-public': collection.get('public') })}>
                        { collection.get('public') ? 'PUBLIC' : 'PRIVATE' }
                      </span>
                  }
                  <DeleteCollection collection={collection}>
                    <TrashIcon />
                    <Tooltip placement="top" className="in" id="tooltip-top">
                      DELETE
                    </Tooltip>
                  </DeleteCollection>
                </React.Fragment>
            }
          </Col>
        </Row>
      </li>
      <EditMetadata
        close={closeFinish}
        visible={visible}
        error={error} />
      </React.Fragment>
    );
  }
}

export default CollectionItem;
