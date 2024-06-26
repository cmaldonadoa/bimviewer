import React from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import { GiCube } from "react-icons/gi";
import { FiBox } from "react-icons/fi";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: "8px",
    minWidth: 0,
    '& svg': {
      fontSize: "14px"
    }
  },
}));

const CustomMenuItem = (props) => {
  const classes = useStyles();
  const icon = props.icon;
  const text = props.text;

  return (
    <React.Fragment>
      <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      <Typography variant="inherit">{text}</Typography>
    </React.Fragment>
  );
};

export default function TreeContextMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  React.useEffect(() => {
    setAnchorEl(props.open);
  }, [props, props.open]);

  const handleClose = () => {
    props.close();
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
      }}
      onClick={(e) => handleClose()}
    >
      <MenuItem onClick={(e) => props.callbacks.lookAt(props.node.objectId)}>
        <Typography variant="inherit">Mirar</Typography>
      </MenuItem>
      <MenuItem onClick={(e) => props.callbacks.toggleVisibility(props.node)}>
        {props.state.visible ? (
          <CustomMenuItem icon={<BsEyeSlashFill />} text="Ocultar" />
        ) : (
          <CustomMenuItem icon={<BsEyeFill />} text="Mostar" />
        )}
      </MenuItem>
      <MenuItem onClick={(e) => props.callbacks.toggleXray(props.node)}>
        {props.state.xrayed ? (
          <CustomMenuItem icon={<GiCube />} text="Definir opaco" />
        ) : (
          <CustomMenuItem icon={<FiBox />} text="Definir transparente" />
        )}
      </MenuItem>
      <MenuItem onClick={(e) => props.callbacks.toggleSelect(props.node)}>
        {props.state.selected ? (
          <CustomMenuItem icon={<CheckBoxIcon />} text="Deseleccionar" />
        ) : (
          <CustomMenuItem
            icon={<CheckBoxOutlineBlankIcon />}
            text="Seleccionar"
          />
        )}
      </MenuItem>
      {/*<MenuItem onClick={(e) => props.callbacks.isolate(props.node)}>
        Aislar
      </MenuItem>*/}
      <Divider />
      <MenuItem onClick={handleClose}>
        <Typography variant="inherit">Cerrar</Typography>
      </MenuItem>
    </Menu>
  );
}
