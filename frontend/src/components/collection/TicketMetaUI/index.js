import Ract, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';

class TicketMeta extends Component {
	static propTypes = {
		auth: PropTypes.object,
		collections: PropTypes.object,
		edited: PropTypes.object,
		editCollection: PropTypes.object,
		editUser: PropTypes.object,
		orderedCollections: PropTypes.object,
		match: PropTypes.object,
		history: PropTypes.object,
		user: PropTypes.object,
	};
	render() {
		//const { isAnon } = this.context;
		//const { auth, collection, editCollection, history, orderedCollections, match: { params }, user } = this.props;
		//const { showModal } = this.state;
		//const userParams = params.user;
		//const displayName = user.get('full_name') || userParam;
		//const canAdmin = auth.getIn(['user', 'username']) === userParam;
		const { collection } = this.props;

		const userLink = user.get('display_url') && (!user.get('display_url').match(/^[a-zA-Z]+:\/\//) ? `http://${user.get('display_url')}` : user.get('display_url'));

		return (
			<React.Fragment>
				<h3>URL</h3>
				<Row>
					Collection URL
				</Row>
				<h3>Author</h3>
				<Row>
					<Col>
						Surname, given name
					</Col>
					<Col>
						Full name in orig. characters
					</Col>
				</Row>
				<h3>Title</h3>
				<Row>
					<Col>
						The Title
					</Col>
					<Col>
						The Title in orig characters
					</Col>
				</Row>
			</React.Fragment>
		);
	}
}
