import React from 'react';
import Dynamsoft from 'dwt';
import { Row, Button } from 'reactstrap';

export default class DWT extends React.Component {
  DWObject = null;
  containerId = 'dwtcontrolContainer';

  state = {
    sources: [],
    selectedSource: null,
    blobUrl: '',
  };

  componentDidMount() {
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => {
      this.Dynamsoft_OnReady();
    });
    Dynamsoft.DWT.handshakeCode = '100583444-100583458';
    Dynamsoft.DWT.organizationID = '100583444';
    Dynamsoft.DWT.UseLocalService = 1;
    Dynamsoft.DWT.ResourcesPath = 'dwt-resources';
    Dynamsoft.DWT.Containers = [
      {
        WebTwainId: 'dwtObject',
        ContainerId: this.containerId,
        Width: '300px',
        Height: '400px',
      },
    ];
    Dynamsoft.DWT.Load();
  }
  Dynamsoft_OnReady() {
    this.DWObject = Dynamsoft.DWT.GetWebTwain(this.containerId);
    const sources = this.DWObject.GetSourceNames();
    this.setState({ sources, selectedSource: sources.length ? 0 : null });
  }
  acquireImage = () => {
    const handleBlobChange = this.props.handleBlobChange;
    this.DWObject.AcquireImage(
      (e) => {
        this.DWObject.CloseSource();
        this.DWObject.ConvertToBlob(
          [...Array(1 + this.DWObject.ImageLayoutPageNumber).keys()],
          Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF,
          function (result, indices, type) {
            handleBlobChange(result);
            // console.log(URL.createObjectURL(result));
            // console.log(result);
          },
          function (errorCode, errorString) {
            console.log(errorString);
          }
        );

        console.log(e);
      },
      (e) => {
        this.DWObject.CloseSource();
        console.log(e);
      }
    );
  };
  render() {
    return (
      <>
        <div id={this.containerId}> </div>
        <Row className="justify-content-center">
          <Button
            color="primary"
            className="mt-4"
            onClick={() => this.acquireImage()}
          >
            {this.state.blobUrl ? 'Re-scan' : 'Scan'}
          </Button>
        </Row>
      </>
    );
  }
}
