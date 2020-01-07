import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';

import { supportEmail } from 'config';

import './style.scss';


function WarcSent() {
  return (
    <React.Fragment>
    <div classNameName="container faq">
      <Helmet>
        <title>What have you done xD</title>
      </Helmet>
      <div className="container wr-content faq">
        <div className="row heading">
              <aside className="col-sm-3 hidden-xs">
                  <img src={require('shared/images/logo.svg')} alt="Webrecorder logo" />
              </aside>
              <div className="col-xs-10 col-xs-push-1 col-sm-9 col-sm-push-0">
                  <h2>Please have Geduld.</h2>
              </div>
          </div>

          <div className="row heading">
              <aside className="col-sm-3 hidden-xs">
                  <p className="credit">
                      <span>Glory to Uni Heidelberg.</span>
                      <a href="https://rhizome.org" target='_blank'>
                          <img src={require('shared/images/hd_logo.gif')} alt="Uni Heidelberg logo" />
                      </a>
                  </p>

                  <p className="credit">
                      <span>With generous support&nbsp;from</span>
                      Eray & Ben
                  </p>
              </aside>
              <div className="col-xs-10 col-xs-push-1 col-sm-9 col-sm-push-0">  
                  <div className='support-logos'>
                      <h4>hier könnte Ihre Anzeige stehen.</h4>

                      
                  </div>
              </div>
          </div>
      </div>
    </div>
    </React.Fragment>
  );
}

export default WarcSent;
