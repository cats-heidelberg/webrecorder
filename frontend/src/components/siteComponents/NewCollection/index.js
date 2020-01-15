import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import { Alert, ControlLabel, FormGroup, FormControl } from 'react-bootstrap';

import { defaultCollectionTitle } from 'config';
import { collection } from 'helpers/userMessaging';

import Modal from 'components/Modal';

import ReactTooltip from 'react-tooltip';

import './style.scss';

const creatorLegend = ['corporate/institutional name', 'personal name'];
const creatorList = [''];

class NewCollection extends Component {
  static propTypes = {
    close: PropTypes.func,
    createCollection: PropTypes.func,
    creatingCollection: PropTypes.bool,
    error: PropTypes.string,
    showModal: PropTypes.bool,
    visible: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      publisher: '',
      collTitle: '',
      pubTitle: '',
      collYear: '',
      copTitle: '',
      surName: '',
      persName: '',
      url: '',
      usermail: '',
      creatorList,
      isPublic: false,
      creatorLegend,
      publishYear: '',
      selectedGroupName: 'corporate/institutional name',
      url: ''
    };
  }
  checkEmail = () => {
    this.setState({ checkEmail: true });
  }

  focusInput = (evt) => {
    this.input.setSelectionRange(0, evt.target.value.length);
  }

  handleInput = (evt) => {
    this.setState({ [evt.target.name]: evt.target.value });
  }
  handleChange = (evt) => {
    if (evt.target.type === 'radio') {
      this.setState({ [evt.target.name]: evt.target.value === 'yes' });
    } else {
      this.setState({ [evt.target.name]: evt.target.value });
    }
  }


  goToCollections = () => {
    const { auth, history } = this.props;
    history.push(`/${auth.getIn(['user', 'username'])}`);
  }

  groupSelect = (evt) => {
    this.setState({ [evt.target.name]: evt.target.value });
    this.setState({ selectedGroupName: evt.target.value });
  }

  onAddItem = () => {
    if (this.state.selectedGroupName==='corporate/institutional name') {
      const temp = this.state.collTitle+', '+this.state.copTitle;
      this.setState(state => {

        const creatorList = [...state.creatorList, temp];
        return {
          creatorList,
          collTitle: '',
          copTitle: ''
        };
      });
    }
    else {
      const temp = this.state.persName+', '+this.state.surName+', '+this.state.collYear;
      this.setState(state => {
        const creatorList = [...state.creatorList, temp];
        return {
          creatorList,
          persName: '',
          surName: '',
          collYear: ''
        };
      });
    }

  }
  onClearArray = () => {
    this.setState({ list: [] });
  };

  rebuildTooltip = () => {
    ReactTooltip.rebuild();
  }

  submit = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    const { publisher, publishYear, collTitle, collYear ,surName, copTitle, isPublic, pubTitle, usermail, url } = this.state;

    this.props.createCollection(pubTitle, isPublic);
  }
  validateEmail = () => {
    const { checkEmail, email } = this.state;

    if (checkEmail && (!email || email.indexOf('@') === -1 || email.match(/\.\w+$/) === null)) {
      return 'error';
    }

    return null;
  }
  validateAuthorship = () => {
    const { collTitle, copTitle, persName, surName, collYear } = this.state;


    if (this.state.selectedGroupName == 'corporate/institutional name') {
      if  (!collTitle) {
        return 'error';
      }
    }else {
      if  (!surName) {
        return 'error';
      }
    }

    return null;
  }



  titleValidation = () => {
    return this.props.error ? 'error' : null;
  }

  togglePublic = (evt) => {
    this.setState({ isPublic: !this.state.isPublic });
  }

  render() {
    const { close, creatingCollection, error, visible } = this.props;
    const { collTitle, collYear, surName, copTitle, isPublic , pubTitle, publishYear, usermail, persName, publisher, selectedGroupName, creatorLegend, url } = this.state;
    if (visible) {
        this.rebuildTooltip();
    }
    return (
      <React.Fragment>
      <Modal
        closeCb={close}
        header="To begin, please fill out the information form below."
        visible={visible}>

        <form onSubmit={this.submit} id="create-coll" className="form-horizontal">
          {
            error &&
              <Alert bsStyle="danger">
                { collection[error] || 'Error encountered' }
              </Alert>
          }
          {
            !__DESKTOP__ &&
              <span className="col-xs-6 col-xs-offset-1">
              <div>
                <FormGroup id="fieldset" validationState={this.validateEmail()}>
                <label onMouseOver={() => { ReactTooltip.show(this.fooRef) }} onMouseOut={() => { ReactTooltip.hide(this.fooRef) }}><span className="glyphicon glyphicon-alert"  ref={ref => this.fooRef = ref} style={{ marginRight: '4px', display: 'inline' ,width: '14px', float:'left'}} data-tip="Any further information regarding your OpenDACHS request will be sent to this e-mail address. The e-mail address must end in 'uni-heidelberg.de'."/>
                    <div  style={{ marginRight: '4px', display: 'inline', float: 'left' }} >E-mail address:</div>
                  </label>
                  <ControlLabel srOnly>Email address:</ControlLabel>
                  <FormControl
                    aria-label="email"
                    type="email"
                    name="usermail"
                    placeholder="email@...uni-heidelberg.de*"
                    autoFocus
                    value={usermail}
                    onChange={this.handleChange}
                    onBlur={this.checkEmail} />
                    <FormControl id="url" aria-label="url" type="text" name="url" onChange={this.handleInput} style={{ height: '33px' }} value={url} placeholder="URL to capture" title='Enter URL to capture' />
                </FormGroup>
              </div>

              <div>
                <FormGroup id="fieldset" validationState={this.validateAuthorship()}>
                <label onMouseOver={() => { ReactTooltip.show(this.fooRef1) }} onMouseOut={() => { ReactTooltip.hide(this.fooRef1) }}><span className="glyphicon glyphicon-alert"  ref={ref => this.fooRef1 = ref} style={{ marginRight: '4px', display: 'inline' ,width: '14px', float:'left'}} data-tip="The main researchers involved working on the data, or the authors of the publication in priority order. May be corporate/institutional or personal names."/>
                    <div  style={{ marginRight: '4px', display: 'inline', float: 'left' }} >Authorship Information</div>
                      </label>
                      <FormControl componentClass="select" placeholder="corporate/institutional name" inputRef={(ref) => { this.state.groupSelect = ref }} onChange={this.groupSelect}>
                      {
                          this.state.creatorLegend.map(group => (
                              <option key={group} value={group} selected={this.state.selectedGroupName == group}>{group}</option>
                          ))
                      }
                      </FormControl>
                        {this.state.selectedGroupName == 'corporate/institutional name' ? (
                          <React.Fragment>
                            <FormControl type="text" placeholder="corporate/institutional name" inputRef={(obj) => { this.input = obj; }} id="collTitle" name="collTitle" onFocus={this.focusInput} onChange={this.handleInput} value={collTitle} />
                            <FormControl type="text" placeholder="In orig. characters*" inputRef={(obj) => { this.input = obj; }} id="copTitle" name="copTitle" onFocus={this.focusInput} onChange={this.handleInput} value={copTitle} />
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <FormControl type="text" placeholder="Surname, given name*" inputRef={(obj) => { this.input = obj; }} id="persName" name="persName" onFocus={this.focusInput} onChange={this.handleInput} value={persName} />
                            <FormControl type="text" placeholder="Full name in orig. characters*" inputRef={(obj) => { this.input = obj; }} id="surName" name="surName" onFocus={this.focusInput} onChange={this.handleInput} value={surName} />
                            <FormControl type="text" placeholder="YYYY" inputRef={(obj) => { this.input = obj; }} id="collYear" name="collYear" onFocus={this.focusInput} onChange={this.handleInput} value={collYear} />
                          </React.Fragment>
                        )}
                        <ul>
                        {
                          this.state.creatorList.map(item => (
                              <li>{item}</li>
                          ))
                        }
                        </ul>
                    <button type="button" class="btn btn-success"  style={{float:'right'}} onClick={this.onAddItem}>Add Creator</button>
                </FormGroup>
              </div>
              <React.Fragment>
              <FormGroup id="fieldset" validationState={this.titleValidation()}>
                <label onMouseOver={() => { ReactTooltip.show(this.fooRef2) }} onMouseOut={() => { ReactTooltip.hide(this.fooRef2) }}><span className="glyphicon glyphicon-alert"  ref={ref => this.fooRef2 = ref} style={{ marginRight: '4px', display: 'inline' ,width: '14px', float:'left'}} data-tip=" The name or title by which the web resource is known."/>
                <div  style={{ marginRight: '4px', display: 'inline', float: 'left' }} >Title:</div>
                  </label>
                <FormControl type="text" placeholder="Title*" inputRef={(obj) => { this.input = obj; }} id="pubTitle" name="pubTitle" onFocus={this.focusInput} onChange={this.handleInput} value={pubTitle} />
                <label onMouseOver={() => { ReactTooltip.show(this.fooRef3) }} onMouseOut={() => { ReactTooltip.hide(this.fooRef3) }}><span className="glyphicon glyphicon-alert"  ref={ref => this.fooRef3 = ref} style={{ marginRight: '4px', display: 'inline' ,width: '14px', float:'left'}} data-tip="The name of the entity that holds, archives, publishes prints, distributes, releases, issues or produces the resource. This property will be used to formulate the citation."/>
                <div  style={{ marginRight: '4px', display: 'inline', float: 'left' }} >Publisher:</div>
                  </label>
                <FormControl type="text" placeholder="Publisher*" inputRef={(obj) => { this.input = obj; }} id="publisher" name="publisher" onFocus={this.focusInput} onChange={this.handleInput} value={publisher} />
                <label onMouseOver={() => { ReactTooltip.show(this.fooRef4) }} onMouseOut={() => { ReactTooltip.hide(this.fooRef4) }}><span className="glyphicon glyphicon-alert"  ref={ref => this.fooRef4 = ref} style={{ marginRight: '4px', display: 'inline' ,width: '14px', float:'left'}} data-tip="Date when the data is made publicly available."/>
                <div  style={{ marginRight: '4px', display: 'inline', float: 'left' }} >Publication date:</div>
                  </label>
                <FormControl type="text" placeholder="Publisher*" inputRef={(obj) => { this.input = obj; }} id="publishYear" name="publishYear" onFocus={this.focusInput} onChange={this.handleInput} value={publishYear} />
              </FormGroup>
              </React.Fragment>
              </span>
          }
            <button className="btn btn-lg btn-primary btn-block" onClick={this.submit} disabled={creatingCollection && !error} type="button">Create</button>
        </form>
      </Modal>
      <ReactTooltip className='extraClass' delayHide={1000} effect='solid' type='info'/>
    </React.Fragment>

    );
  }
}

export default NewCollection;
