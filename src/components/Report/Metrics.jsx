import React, { Fragment, useEffect, useState } from "react";
import {
  Container,
  Card,
  Button,
  CardHeader,
  CardBody,
  CardTitle,
  FormGroup,
  Label,
  Row,
  Col,
  Input,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Table,
  Badge,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import classnames from "classnames";

import Sidebar from "../layout/Sidebar";
import TeamMember from "./TeamMember";
import ReportInvoice from "./ReportInvoice";
import Vendors from "./Vendors";
import Deviations from "./Deviations";

export default function Metrics() {
  const [activeTab, setActiveTab] = useState("1");

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <Fragment>
      {/* navbar */}
      <div className="wrapper">
        <Sidebar />
        <div className="page-content-wrapper">
          <Container fluid={true}>
            <div className="page-title">
              <h3>Reporting Metrics</h3>
            </div>

            <div className="mb-5 metrics-tab">
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "1" })}
                    onClick={() => {
                      toggle("1");
                    }}
                  >
                    Invoices
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => {
                      toggle("2");
                    }}
                  >
                    Team members
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => {
                      toggle("3");
                    }}
                  >
                    Supplier
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "4" })}
                    onClick={() => {
                      toggle("4");
                    }}
                  >
                    Advanced Metrices
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <ReportInvoice />
                </TabPane>
                <TabPane tabId="2">
                  <TeamMember />
                </TabPane>

                <TabPane tabId="3">
                  <Vendors />
                </TabPane>
                <TabPane tabId="4">
                  <Deviations />
                </TabPane>
              </TabContent>
            </div>
          </Container>
        </div>
      </div>
    </Fragment>
  );
}
