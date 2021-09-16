import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Panel } from 'react-bootstrap';
import { connect } from 'react-redux';

import { set404 } from 'store/modules/controls';

import SetStatus from 'components/SetStatus';


class HttpStatus extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    dispatch: PropTypes.func,
    status: PropTypes.number
  };

  static defaultProps = {
    status: 404,
  };

  componentWillMount() {
    this.props.dispatch(set404(true));
  }

  componentWillUnmount() {
    this.props.dispatch(set404(false));
  }

  render() {
    const { children, status } = this.props;

    return (
      <SetStatus code={status}>
        <Helmet>
          <title>There's been an error</title>
        </Helmet>
        
        <div class="panel panel-default">
          <div class="panel-heading">There's been an error</div>
          <div class="panel-body">{ children || 'No such page or content is not accessible.'}</div>
        </div>
      </SetStatus>
    );
  }
}

export default connect()(HttpStatus);
