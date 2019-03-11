
import React, { Component } from 'react';
import classNames from 'classnames';
import { Button, Row } from 'react-bootstrap';

import './style.scss';


class RequestForm extends Component {
	render() {
		return(
		<form className="start-recording-homepage">

			<fieldset className="col-md-8 col-md-offset-2">
				<Row>
					<p className="col-md-2 standalone-dropdown-label">E-mail address</p>
					<div className="col-md-10">
						<input className="w100" placeholder="email@...uni-heidelberg.de"/>
					</div>
				</Row>
				<Row>
					<p className="col-md-2 standalone-dropdown-label">URL</p>
					<div className="col-md-10">
						<input className="w100" placeholder="http(s)://...*"/>
					</div>
				</Row>
			</fieldset>

			<fieldset className="col-md-8 col-md-offset-2 top-buffer">
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Title</p>
					<div className="col-md-5">
						<input className="w100" placeholder="Title*"/>
					</div>
					<div className="col-md-5">
						<input className="w100" placeholder="In orig. charackters*"/>
					</div>
				</Row>
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Publisher</p>
					<div className="col-md-5">
						<input className="w100" placeholder="Publisher*"/>
					</div>
					<div className="col-md-5">
						<input className="w100" placeholder="In orig. charackters*"/>
					</div>
				</Row>
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Publication date</p>
					<div className="col-md-5">
						<input className="w100" type="date" />
					</div>
				</Row>
			</fieldset>

			<fieldset className="col-md-8 col-md-offset-2 top-buffer">
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Resource type</p>
					<div className="col-md-5">
						<select className="w100">
							<option value="audiovisual">audiovisual</option>
							<option value="collection">Collection</option>
							<option value="image">Image</option>
							<option value="sound">Sound</option>
							<option value="text">Text</option>
						</select>
					</div>
					<div className="col-md-5">
						<input className="w100" value="Website"/>
					</div>
				</Row>

				<fieldset className="col-md-10 col-md-offset-2 top-buffer">
					<Row>
						<p className="col-md-3 standalone-dropdown-label">Subject headings</p>
						<div className="col-md-5">
							<input className="w100"/>
						</div>
						<div className="col-md-2">
							<Button>
								Remove
							</Button>
						</div>
					</Row>
				</fieldset>

			</fieldset>

			<div className="col-md-8 col-md-offset-2 top-buffer">
				<Button type="submit">
					Submit
				</Button>
			</div>
		</form>
		);
	}
}

export default RequestForm;
