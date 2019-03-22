
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
			{ name: "" },
		],
		people: [
			{ name: "" }
		],
		authors: [
			{ }
		],
	}

	handleSubmit(event) {
		event.preventDefault();
		const meta = new FormData(event.target);

		//fetch('/api/v1/collections', {
		//	params: { 'user': "Friedrich" },
		//	method: 'POST',
		//	body: meta
		//});
		client.pos(`${config.apiPath}/collections`, {
			params: { 'user': user },
			data: {
				'title': "aus dem Formular generiert",
				'public': false,
				public_index: true,
				meta
			}
		});
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

	removeSubject(i) {
		let subjects = [...this.state.subjects];
		this.state.subjects.splice(i, 1);
		this.setState(this.state);
	}

	removePerson(i) {
		let people = [...this.state.people];
		this.state.people.splice(i, 1);
		this.setState(this.state);
	}

	changeSubject(i, event) {
		this.state.subjects[i].name = event.target.value;
		this.setState(this.state);
	}

	changePerson(i, event) {
		this.state.people[i].name = event.target.value;
		this.setState(this.state);
	}

	render() {
		let { subjects, people } = this.state;

		return(
		<form className="start-recording-homepage" onSubmit={this.handleSubmit}>

			<fieldset className="col-md-8 col-md-offset-2">
				<Row>
					<p className="col-md-2 standalone-dropdown-label">E-mail address</p>
					<div className="col-md-10">
						<input className="form-control" placeholder="email@...uni-heidelberg.de" name="mail"/>
					</div>
				</Row>
				<Row>
					<p className="col-md-2 standalone-dropdown-label">URL</p>
					<div className="col-md-10">
						<input className="form-control" placeholder="http(s)://...*" name="url"/>
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
						<input className="form-control" placeholder="Title*" name="title"/>
					</div>
					<div className="col-md-5">
						<input className="form-control" placeholder="In orig. charackters*" name="orig-title"/>
					</div>
				</Row>
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Publisher</p>
					<div className="col-md-5">
						<input className="w100" placeholder="Publisher*" name="publisher"/>
					</div>
					<div className="col-md-5">
						<input className="form-control" placeholder="In orig. charackters*" name="orig-publisher"/>
					</div>
				</Row>
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Publication date</p>
					<div className="col-md-5">
						<input className="form-control" type="date" name="publication-date"/>
					</div>
				</Row>
			</fieldset>

			<fieldset className="col-md-8 col-md-offset-2 top-buffer">
				<Row>
					<p className="col-md-2 standalone-dropdown-label">Resource type</p>
					<div className="col-md-5">
						<select className="form-control" name="type">
							<option value="audiovisual">audiovisual</option>
							<option value="collection">Collection</option>
							<option value="image">Image</option>
							<option value="sound">Sound</option>
							<option value="text">Text</option>
						</select>
					</div>
					<div className="col-md-5">
						<input className="form-control" value="Website" name="website"/>
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
											<input className="form-control" value={val.name||''} onChange={this.changeSubject.bind(this, idx)}/>
										</div>
										<div className="col-md-2">
											<Button className="btn-danger w100" onClick={this.removeSubject.bind(this, idx)}>
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
											<input className="form-control" value={val.name||''} onChange={this.changePerson.bind(this, idx)}/>
										</div>
										<div className="col-md-2">
											<Button className="btn-danger w100" onClick={this.removePerson.bind(this, idx)}>
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
