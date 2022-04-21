import React, { Fragment, useState } from "react";
import {
  Container,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import Sidebar from "../layout/Sidebar";
import classnames from "classnames";
import Editprofile from "./Editprofile";
import Editpassword from "./Editpassword";
import EditTeam from "./EditTeam";
import { getRole } from "../common/functions";

export default function ManageProfile() {
  const [activeTab, setActiveTab] = useState("1");
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <Fragment>
      <div className="wrapper">
        <Sidebar />
        <div className="page-content-wrapper">
          <Container>
            <div className="page-title">
              <h3>Manage Profile</h3>
            </div>
            <div>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "1" })}
                    onClick={() => {
                      toggle("1");
                    }}
                  >
                    General
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => {
                      toggle("2");
                    }}
                  >
                    Security
                  </NavLink>
                </NavItem>

                { (getRole() !== "Team Member") &&
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => {
                      toggle("3");
                    }}
                  >
                    Company Info
                  </NavLink>
                </NavItem>
                } 
              </Nav>

              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <Editprofile />
                </TabPane>

                <TabPane tabId="2">
                  <Editpassword />
                </TabPane>

                {getRole() !== "Team Member" &&
                  <TabPane tabId="3">
                    <EditTeam />
                  </TabPane>
                } 
              </TabContent>
            </div>
          </Container>
        </div>
      </div>
    </Fragment>
  );
}
