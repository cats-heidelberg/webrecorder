
import React, { Component } from 'react';
import classNames from 'classnames';
import { Button, Row } from 'react-bootstrap';

import './style.scss';

class Author extends Component {
}

class Heading extends Component {
}

class RequestForm extends Component {
	state = {
		subjects:  [
			{ name: "" }, { name: "" },
		],
		people: [
			{ name: "" }
		],
		authors: [
			{ }
		],
	}

	addSubject = (e) => {
		this.setState((prevState) => ({
			subjects: [...prevState.subjects, { name: "" }],
		}))
	}

	addPerson = (e) => {
		this.setState((prevState) => ({
			people: [...prevState.people, { name: "" }],
		}))
	}

	render() {
		let { subjects, people } = this.state;

		return(
		<form className="start-recording-homepage">

			<fieldset className="col-md-8 col-md-offset-2">
				<Row>
					<p className="col-md-2 standalone-dropdown-label">E-mail address</p>
					<div className="col-md-10">
						<input className="form-control" placeholder="email@...uni-heidelberg.de"/>
					</div>
				</Row>
				<Row>
					<p className="col-md-2 standalone-dropdown-label">URL</p>
					<div className="col-md-10">
						<input className="form-control" placeholder="http(s)://...*"/>
					</div>
				</Row>
			</fieldset>

			<fieldset className="col-md-8 col-md-offset-2">
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Authorship Information</p>
				</Row>
			</fieldset>

			<fieldset className="col-md-8 col-md-offset-2 top-buffer">
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Title</p>
					<div className="col-md-5">
						<input className="form-control" placeholder="Title*"/>
					</div>
					<div className="col-md-5">
						<input className="form-control" placeholder="In orig. charackters*"/>
					</div>
				</Row>
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Publisher</p>
					<div className="col-md-5">
						<input className="w100" placeholder="Publisher*"/>
					</div>
					<div className="col-md-5">
						<input className="form-control" placeholder="In orig. charackters*"/>
					</div>
				</Row>
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Publication date</p>
					<div className="col-md-5">
						<input className="form-control" type="date" />
					</div>
				</Row>
			</fieldset>

			<fieldset className="col-md-8 col-md-offset-2 top-buffer">
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Resource type</p>
					<div className="col-md-5">
						<select className="form-control">
							<option value="audiovisual">audiovisual</option>
							<option value="collection">Collection</option>
							<option value="image">Image</option>
							<option value="sound">Sound</option>
							<option value="text">Text</option>
						</select>
					</div>
					<div className="col-md-5">
						<input className="form-control" value="Website"/>
					</div>
				</Row>

				<Row>
					<p className="col-md-2 standalone-dropdown-label">Subject headings</p>
					<fieldset className="col-md-10">
						{
							subjects.map((val, idx) => {
								return(
									<Row>
										<div className="col-md-10">
											<input className="form-control"/>
										</div>
										<div className="col-md-2">
											<Button className="btn-danger w100">
												Remove
											</Button>
										</div>
									</Row>
								)
							})
						}
						<Row>
							<div className="col-md-2">
								<Button className="btn-primary w100" onClick={this.addSubject}>
									Add
								</Button>
							</div>
						</Row>
					</fieldset>
				</Row>
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Person headings</p>
					<fieldset className="col-md-10">
						{
							people.map((val, idx) => {
								return(
									<Row>
										<div className="col-md-10">
											<input className="form-control"/>
										</div>
										<div className="col-md-2">
											<Button className="btn-danger w100">
												Remove
											</Button>
										</div>
									</Row>
								)
							})
						}
						<Row>
							<div className="col-md-2">
								<Button className="btn-primary w100" onClick={this.addPerson}>
									Add
								</Button>
							</div>
						</Row>
					</fieldset>
				</Row>
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
