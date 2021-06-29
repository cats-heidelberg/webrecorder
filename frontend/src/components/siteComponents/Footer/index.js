import React from "react";
import { Link } from "react-router-dom";

import { announceMailingList, supportEmail, supporterPortal } from "config";

import "./style.scss";

function Footer() {
  const donateNow = () => {
    window.location.href = supporterPortal;
  };

  return (
    <footer className="footer">
      <div className="container top-buffer bottom-buffer">
        <div className="row">
          <div className="col-xs-12 col-sm-6 project-info">
            <div className="links">
              <ul>
                <li>
                  <span style={{ fontWeight: "1.6em" }}>
                    © Copyright Universität Heidelberg
                  </span>
                </li>
                <li>
                  <a
                    href="https://www.uni-heidelberg.de/impressum.html"
                    target="_blank"
                  >
                    Impressum
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.uni-heidelberg.de/datenschutzerklaerung_web.html"
                    target="_blank"
                  >
                    Datenschutzerklärung
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
