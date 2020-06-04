import React from "react";
import {
  Container,
  Row,
  Col,
  Button,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { GiMove } from "react-icons/gi";
import { GoPin } from "react-icons/go";
import {
  IoMdSearch,
  IoMdOptions,
  IoMdSave,
  IoMdInformationCircle,
  IoMdMenu,
  IoMdExpand,
  IoMdDownload,
  IoMdClose,
  IoMdBuild,
  IoMdVideocam
} from "react-icons/io";
import { Zoom, Flip } from "react-reveal";
import Toaster from "./Toaster";
import Toasty from "./Toasty";

export default class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { toasts: [] };
  }

  render() {
    var { filename, folder } = this.props;
    var { toasts } = this.state;
    return (
      <React.Fragment>
        <VerticalMenu
          open={<NavButton id="burger-menu" icon={<IoMdMenu />} text="Abrir" />}
          close={
            <NavButton id="close-menu" icon={<IoMdClose />} text="Cerrar" />
          }
        >
          <HorizontalMenu
            control={
              <NavButton
                id="camera-menu"
                icon={<IoMdVideocam />}
                text="Cámara"
              />
            }
          >
            <NavButton
              id="orbit-camera"
              icon={<OrbitCamera />}
              text="Orbitar"
              style={{ padding: "9px" }}
              onClick={() => window.orbitCameraFun()}
            />
            <NavButton
              id="pan-camera"
              icon={<GiMove />}
              text="Mover"
              style={{ padding: "10px" }}
              onClick={() => window.panCameraFun()}
            />
            <NavButton
              id="zoom-camera"
              icon={<IoMdSearch />}
              text="Zoom"
              style={{ padding: "11px" }}
              onClick={() => window.zoomCameraFun()}
            />
          </HorizontalMenu>

          <HorizontalMenu
            control={
              <NavButton
                id="tools-menu"
                icon={<IoMdBuild />}
                text="Herramientas"
              />
            }
          >
            <NavButton
              id="settings"
              icon={<IoMdOptions />}
              text="Opciones"
              onClick={() => window.effectsFun()}
            />
            <NavButton
              id="fit-model"
              icon={<IoMdExpand />}
              text="Ajustar"
              onClick={() => window.fitToScreenFun()}
            />
            <NavButton
              id="annotations"
              icon={<GoPin />}
              text="Anotaciones"
              onClick={() => window.annotationsFun()}
            />
            <NavButton
              id="metadata"
              icon={<IoMdInformationCircle />}
              text="Metadatos"
              onClick={() => window.metadataFun()}
            />
            <Button
              id="save-annotations"
              className="d-none"
              onClick={() => {
                window.saveFun(filename, folder, () => {
                  var toast = <Toasty variant="SAVE" />;
                  this.setState(prevState => ({
                    toasts: [...prevState.toasts, toast]
                  }));
                });
              }}
            />
          </HorizontalMenu>

          <HorizontalMenu
            control={
              <NavButton
                id="file-menu"
                icon={<IoMdDownload />}
                text="Descargar"
              />
            }
          >
            <NavButton
              id="pdf"
              icon={<FaFilePdf />}
              text="PDF"
              style={{ padding: "13px" }}
              onClick={() => {
                var i = this.state.toasts.length;
                var toast = <Toasty variant="PDF" />;
                this.setState(prevState => ({
                  toasts: [...prevState.toasts, toast]
                }));
                var t = new Date();
                setTimeout(() => {
                  window.printFun(() => {
                    var toasts = this.state.toasts.slice();
                    toasts[i] = null;
                    this.setState({ toasts: toasts });
                  });
                }, 0);
              }}
            />
            <NavButton
              id="xlsx"
              icon={<FaFileExcel />}
              text="XLSX"
              style={{ padding: "13px" }}
              onClick={() => {
                var i = this.state.toasts.length;
                var toast = <Toasty variant="XLSX" />;
                this.setState(prevState => ({
                  toasts: [...prevState.toasts, toast]
                }));
                window.getXLSFun(filename, folder, () => {
                  var toasts = this.state.toasts.slice();
                  toasts[i] = null;
                  this.setState({ toasts: toasts });
                });
              }}
            />
          </HorizontalMenu>
        </VerticalMenu>
        <Toaster toasts={toasts} />
      </React.Fragment>
    );
  }
}

class OrbitCamera extends React.Component {
  render() {
    return (
      <svg
        height="512"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          class="icon"
          fill="#fff"
          stroke="#fff"
          stroke-width="10"
          stroke-linecap="butt"
          d={`M817.6 383.616l-29.184 56.96c32.896 16.864 52.576 36.288 52.576 52 0 42.4-128.192
              104-329.024 104-26.528 0-52.416-1.216-77.6-3.36l7.008-77.408-74.656 48.128-74.656
              48.128 64.832 60.704 64.832 60.704 6.912-76.48c27.104 2.336 54.944 3.552 83.36 
              3.552 195.328 0 393.024-57.696 393.024-168C904.96 463.296 889.824 420.64 817.6 
              383.616zM182.912 492.576c0-40.032 116.032-98.88 305.056-103.712l-1.632-63.968c-176.96
              4.512-367.424 58.912-367.424 167.68 0 33.76 19.744 82.176 113.728 121.088l24.48-59.136C202.4
              531.904 182.912 507.68 182.912 492.576zM510.784 816c-19.264 0-42.176-22.528-61.312-60.32l-57.088
              28.928c39.936 78.816 86.432 95.36 118.4 95.36 62.432 0 116.48-63.2 148.352-173.376l-61.504-17.76C572.288
              776.672 535.744 816 510.784 816zM506.56 208c42.304 0 88.704 80.672 102.08 196.672l-77.056 
              7.136 60.864 64.704 60.864 64.704 47.904-74.816 47.904-74.784-76.544 7.104C656.288 
              249.44 590.368 144 506.56 144c-53.792 0-100.96 42.336-132.8 119.2l59.136 
              24.512C453.248 238.56 481.472 208 506.56 208z`}
        />
      </svg>
    );
  }
}

class NavButton extends React.Component {
  render() {
    var { id, style, text, icon, onClick } = this.props;
    return (
      <OverlayTrigger placement="bottom" overlay={<Tooltip>{text}</Tooltip>}>
        <Button
          id={id}
          style={style}
          className="nav-btn m-1"
          variant="dark"
          onClick={onClick}
        >
          {icon}
        </Button>
      </OverlayTrigger>
    );
  }
}

class HorizontalMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: false };
  }

  render() {
    var { control, children } = this.props;
    return (
      <React.Fragment>
        <Col xs="auto">
          {React.cloneElement(control, {
            onClick: () => {
              this.setState({ show: !this.state.show });
            }
          })}
        </Col>
        <Col xs="auto">
          <Zoom
            cascade
            when={this.state.show}
            duration={children.length * 130}
            unmountOnExit
            mountOnEnter
          >
            <div className="row no-gutters" style={{ width: "max-content" }}>
              {React.Children.map(children, child => {
                return <Col xs="auto">{child}</Col>;
              })}
            </div>
          </Zoom>
        </Col>
      </React.Fragment>
    );
  }
}

class VerticalMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: false };
  }

  render() {
    var { open, close, children } = this.props;
    return (
      <React.Fragment>
        <Row noGutters style={{ width: "max-content" }}>
          <Col xs="auto">
            {this.state.show
              ? React.cloneElement(close, {
                  className: "animated rotateIn",
                  onClick: () => {
                    this.setState({ show: false });
                  }
                })
              : React.cloneElement(open, {
                  className: "animated rotateIn",
                  onClick: () => {
                    this.setState({ show: true });
                  }
                })}
          </Col>
        </Row>
        <Flip
          top
          cascade
          when={this.state.show}
          duration={children.length * 130}
          unmountOnExit
          mountOnEnter
        >
          {React.Children.map(children, child => {
            return (
              <Row noGutters style={{ width: "max-content" }}>
                {child}
              </Row>
            );
          })}
        </Flip>
      </React.Fragment>
    );
  }
}
