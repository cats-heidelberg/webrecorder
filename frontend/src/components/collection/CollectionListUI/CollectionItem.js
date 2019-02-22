import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import removeMd from 'remove-markdown';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Button, Col, Row, Tooltip } from 'react-bootstrap';

import { buildDate, getCollectionLink, truncate } from 'helpers/utils';

import SizeFormat from 'components/SizeFormat';
import { DeleteCollection } from 'containers';
import { TrashIcon, PlusIcon } from 'components/icons';

import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';
//import 'react-accessible-accordion/dist/minimal-example.css';
import 'react-accessible-accordion/dist/fancy-example.css';

class CollectionItem extends PureComponent {
  static propTypes = {
    canAdmin: PropTypes.bool,
    addToList: PropTypes.func,
    collId: PropTypes.string,
    collUser: PropTypes.string,
    editCollection: PropTypes.func,
    id: PropTypes.string,
    isOver: PropTypes.bool,
    collection: PropTypes.object,
    selected: PropTypes.bool,
    history: PropTypes.string
  };

	//detailView = false;


  manageCollection = () => {
    const { collection, history } = this.props;
    history.push(getCollectionLink(collection, true));
  }

  newSession = () => {
    const { collection, history } = this.props;
    history.push(`${getCollectionLink(collection)}/$new`);
  }

  toggleVisibility = () => {
    const { collection } = this.props;
    this.props.editCollection(collection.get('owner'), collection.get('id'), { public: !collection.get('public') });
  }

  toggleDetailView = () => {
		if (null == this.detailView) {
			this.detailView = true;
		} else {
			this.detailView = !(this.detailView);
		}
  }

  render() {
    const { canAdmin, collection } = this.props;
    const descClasses = classNames('left-buffer list-group-item', { 'has-description': collection.get('desc') });

		return (
			<AccordionItem>
				<AccordionItemTitle>
					<Row>
						<Col sm={7} md={7}>
							<a href="http://mathphys.info">Ein Generischer Ticket Titel</a>
						</Col>
						<Col sm={1} md={1}>
							<p>1,3MB</p>
						</Col>
						<Col sm={2} md={2}>
							<p>Erstellt am <i>Bla</i></p>
						</Col>
						<Col sm={1} md={1}>
							<span>
								PUBLIC
							</span>
						</Col>
						<Col sm={1} md={1}>
							<div className="accordion__arrow" role="presentation" />
						</Col>
					</Row>
				</AccordionItemTitle>
				<AccordionItemBody>
					<Row>
						<p>
							Stuff
						</p>
					</Row>
				</AccordionItemBody>
			</AccordionItem>
		);
		/*
		return (
			<React.Fragment>
			<AccordionItem>
				<AccordionItemTitle>
					<Row>
						<Col sm={6} md={6}>
							<Link className="collection-title" to={`${getCollectionLink(collection)}`}>{collection.get('title')}</Link>
						</Col>
						<Col xs={1} md={1} className="collection-list-size">
						 <SizeFormat bytes={collection.get('size')} />
						</Col>
						<Col className="collection-time" xs={2} md={2}>
							Created {buildDate(collection.get('created_at'), false, true)}
						</Col>
						<Col className="collection-delete-action col-xs-offset-7 col-md-offset-0" xs={5} md={2}>
							{
								canAdmin &&
                  <span className={classNames('visibility-button', { 'is-public': collection.get('public') })}>
                    { collection.get('public') ? 'PUBLIC' : 'PRIVATE' }
                  </span>
							}
						</Col>
						<Col xs={1} md={1}>
							<Col xs={1} md={1}><div className="accordion__arrow" role="presentation" /></Col>
						</Col>
					</Row>
				</AccordionItemTitle>
				<AccordionItemBody>
					<p>Stuff der stellvertretend für die Meta infos Steht</p>
				</AccordionItemBody>
			</AccordionItem>
			</React.Fragment>
    );
		*/
		/*
    return (
      <li className={descClasses} key={collection.get('id')}>
        <Row>
					<Col sm={1} md={1}>
						<Button onclick={this.toggleDetailView}><PlusIcon /></Button>
					</Col>
					<Col sm={6} md={6}>
            <Link className="collection-title" to={`${getCollectionLink(collection)}`}>{collection.get('title')}</Link>
            <p className="collection-list-description">
              {
                truncate(removeMd(collection.get('desc'), { useImgAltText: false }), 3, new RegExp(/([.!?])/))
              }
            </p>
          </Col>
          <Col xs={1} md={1} className="collection-list-size">
            <SizeFormat bytes={collection.get('size')} />
          </Col>
          <Col className="collection-time" xs={2} md={2}>
            Created {buildDate(collection.get('created_at'), false, true)}
          </Col>
          <Col className="collection-delete-action col-xs-offset-7 col-md-offset-0" xs={5} md={2}>
            {
              canAdmin &&
                  <span className={classNames('visibility-button', { 'is-public': collection.get('public') })}>
                    { collection.get('public') ? 'PUBLIC' : 'PRIVATE' }
                  </span>
            }
          </Col>
        </Row>
				{
					this.detailView && <Row>
						<p>Stuff der stellvertretend für die Meta infos Steht</p>
					</Row>
				}
      </li>
    );
		*/
  }
}

export default CollectionItem;
