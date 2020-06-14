import React from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import { GiCube } from "react-icons/gi";
import { FiBox } from "react-icons/fi";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

export default function TreeContextMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const ref = React.createRef();

  React.useEffect(() => {
      if (props.open) {
        ref.current.click();
      } else {
        setAnchorEl(null);
      }
  }, [props, props.open]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    props.close();
  };

  return (
    <React.Fragment>
      <button
        style={{
          position: "absolute",
          left: `${props.x}px`,
          top: `${props.y}px`,
          visibility: "hidden"
        }}
        ref={ref}
        onClick={handleClick}
      />
      <Menu
        id="canvas-context-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(props.open) && Boolean(anchorEl)}
        onClose={handleClose}
        style={{
          position: "absolute",
          top: `25px`,
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          //handleClose();
          //props.reopen(e.currentTarget);
        }}
        onClick={(e) => handleClose()}
      >
        <MenuItem onClick={(e) => props.callbacks.lookAt(props.entity.id)}>
          Mirar
        </MenuItem>
        <MenuItem
          onClick={(e) => props.callbacks.toggleVisibility(props.entity)}
        >
          {props.state.visible ? (
            <span>
              <BsEyeSlashFill /> Ocultar
            </span>
          ) : (
            <span>
              <BsEyeFill /> Mostar
            </span>
          )}
        </MenuItem>
        <MenuItem onClick={(e) => props.callbacks.toggleXray(props.entity)}>
          {props.state.xrayed ? (
            <span>
              <GiCube /> Definir opaco
            </span>
          ) : (
            <span>
              <FiBox /> Definir transparente
            </span>
          )}
        </MenuItem>
        <MenuItem onClick={(e) => props.callbacks.toggleSelect(props.entity)}>
          {props.state.selected ? (
            <span>
              <CheckBoxIcon /> Deseleccionar
            </span>
          ) : (
            <span>
              <CheckBoxOutlineBlankIcon /> Seleccionar
            </span>
          )}
        </MenuItem>
        {/*<MenuItem onClick={(e) => props.callbacks.isolate(props.entity)}>
        Aislar
      </MenuItem>*/}
        <Divider />
        <MenuItem onClick={handleClose}>Cerrar</MenuItem>
      </Menu>
    </React.Fragment>
  );
}
