import React, { Fragment, useCallback, useEffect, useState } from "react";
import {
  Modal,
  Button,
  ModalFooter,
  ModalBody,
  CardHeader,
  CardBody,
  Card,
  TabPane,
  TabContent,
  NavItem,
  Nav,
  NavLink,
} from "reactstrap";
import classnames from "classnames";

import { authHeader, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import Swal from "sweetalert2";
import { Document, Page, pdfjs } from "react-pdf";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import pdfjsLib from "pdfjs-dist/webpack";
import { ACCESS_S3_FILE } from "../common/url";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { deCryptFun, enCryptFun } from "../common/functions";
// import { NavLink } from "react-router-dom";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.5.207/pdf.worker.js`;

export default function Preview(props) {
  const {
    filePath,
    Toggle,
    DetailsToggle,
    emailContentFilePath = "Mail body not available!",
  } = props;
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [activeTab, setActiveTab] = useState("1");

  const tabToggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const onDocumentError = async (e) => {
    console.log("error", e);
  };
  const changePage = useCallback(
    (offset) =>
      setPageNumber((prevPageNumber) => (prevPageNumber || 1) + offset),
    []
  );

  const previousPage = useCallback(() => changePage(-1), [changePage]);

  const nextPage = useCallback(() => changePage(1), [changePage]);
  const [documentIndex, setIndex] = useState(1);
  const [pdfDimension, setPdfDimension] = useState({
    width: 700,
    height: 900,
  });

  let GetFileAccess = async () => {
    if (filePath) {
      setLoading(true);
      const config = {
        method: "POST",
        url: ACCESS_S3_FILE,
        data: {  filePath 
        },

        headers: authHeader(),
      };
      try {
        const response = await API(config);
       const { status, url } = response.data;
        if (status === "Success") {
          setUrl(url);
        }
      } catch (error) {
        console.error("pdfviewerror", error);
        let errorObj = Object.assign({}, error);
        let { data } = errorObj.response;
        let { message } = data;

        Swal.fire("Error", message);
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire(getAlertToast("error", "No file is found!"));
    }
  };

  useEffect(() => {
    GetFileAccess();
  }, []);

  return (
    <Modal size="lg" isOpen={Toggle} toggle={DetailsToggle}>
      <ModalBody>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "1" })}
              onClick={() => {
                tabToggle("1");
              }}
            >
              Invoice
            </NavLink>
          </NavItem>
          {/* <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "2" })}
              onClick={() => {
                tabToggle("2");
              }}
            >
              Email Body
            </NavLink>
          </NavItem> */}
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Card>
              {/* <CardHeader>Invoice</CardHeader> */}
              <CardBody>
                <TransformWrapper
                  defaultScale={1}
                  defaultPositionX={200}
                  defaultPositionY={100}
                >
                  {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                    <Fragment>
                      <div className="tools">
                        <button onClick={zoomIn}>+</button>
                        <button onClick={zoomOut}>-</button>
                        <button onClick={resetTransform}>x</button>
                      </div>
                      {/* <canvas id="myCanvas" height="100" weight="100"></canvas> */}
                      <TransformComponent>
                        {/* {url && ( */}
                        <Document
                          file={url}
                          onLoadSuccess={onDocumentLoadSuccess}
                          onLoadError={onDocumentError}
                          overflow="scroll"
                          width="100"
                          noData="Loading PDF..."
                        >
                          <Page
                            pageNumber={pageNumber}
                            // width="100"
                            // overflow="scroll"
                          />
                        </Document>
                        {/* )} */}
                        {/* <canvas
                      data-document_id={0}
                      id={`canvas_${0}`}
                      style={{
                        border: "2px solid #1b3e6f",
                        display: "inline-block",
                        cursor: "pointer",
                      }}
                    ></canvas> */}
                      </TransformComponent>
                    </Fragment>
                  )}
                </TransformWrapper>
                {numPages ? (
                  <div>
                    <button
                      disabled={pageNumber <= 1}
                      onClick={previousPage}
                      type="button"
                    >
                      <FaChevronLeft />
                    </button>
                    <span>
                      {`Page ${pageNumber || (numPages ? 1 : "--")} of ${
                        numPages || "--"
                      }`}
                    </span>
                    <button
                      disabled={pageNumber >= numPages}
                      onClick={nextPage}
                      type="button"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                ) : (
                  ""
                )}
              </CardBody>

              <ModalFooter>
                <Button color="danger" onClick={DetailsToggle}>
                  Close
                </Button>
              </ModalFooter>
            </Card>
          </TabPane>
          {/* <TabPane tabId="2">
            <Card>
              <CardBody>{emailContentFilePath}</CardBody>
              <ModalFooter>
                <Button color="danger" onClick={DetailsToggle}>
                  Close
                </Button>
              </ModalFooter>
            </Card>
          </TabPane> */}
        </TabContent>
      </ModalBody>
    </Modal>
  );
}
