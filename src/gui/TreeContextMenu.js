import React from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from '@material-ui/core/Divider';
import { GiCube } from "react-icons/gi";
import { FiBox } from "react-icons/fi";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

export default function TreeContextMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  React.useEffect(() => {
    setAnchorEl(props.open);
  }, [props, props.open]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Menu
      id="tree-context-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
      style={{
        position: "absolute",
        left: `${props.x}px`,
        top: `${props.y}px`,
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        handleClose();
        props.reopen(e.currentTarget);
      }}
      onClick={(e) => handleClose()}
    >
      <MenuItem onClick={(e) => props.callbacks.lookAt(props.node.objectId)}>Mirar</MenuItem>
      <MenuItem onClick={(e) => props.callbacks.toggleVisibility(props.node)}>
        {props.options.visible ? <span><BsEyeSlashFill/> Ocultar</span> : <span><BsEyeFill/> Mostar</span>}
      </MenuItem>
      <MenuItem onClick={(e) => props.callbacks.toggleXray(props.node)}>
        {props.options.xrayed ? <span><GiCube /> Definir opaco</span> : <span><FiBox /> Definir transparente</span>}
      </MenuItem>
      <MenuItem onClick={(e) => props.callbacks.toggleSelect(props.node)}>
        {props.options.selected ? <span><CheckBoxIcon /> Deseleccionar</span> : <span><CheckBoxOutlineBlankIcon/> Seleccionar</span>}
      </MenuItem>
      <MenuItem
        onClick={(e) => props.callbacks.isolate(props.node)}
      >
        Aislar
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleClose}>Cerrar</MenuItem>
    </Menu>
  );
}
