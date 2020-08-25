import React from "react";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import ListItem from "@material-ui/core/ListItem";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import Grid from "@material-ui/core/Grid";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { FaFilePdf } from "react-icons/fa";
import { SiJson } from "react-icons/si";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  icon: {
    minWidth: "40px",
  },
}));

const StyledMenuItemButton = (props) => {
  const classes = useStyles();
  const label = props.label;
  const onClick = props.onClick;
  const icon = props.icon;
  const className = props.className;

  return (
    <MenuItem className={className} onClick={onClick}>
      {icon ? (
        <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      ) : null}
      <ListItemText primary={label} />
    </MenuItem>
  );
};

const BCF = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [deleted, setDeleted] = React.useState(false);
  const img = props.img;
  const data = props.data;
  const name = props.name;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const downloadJson = () => {
    var url = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    var a = document.createElement("a");
    a.href = url;
    a.download = `${name}.json`;
    a.click();
    a.remove();
    handleClose()
  };

  const downloadPdf = () => {
    console.log("pdf");
  };

  const deleteBcf = () => {
    props.onDelete(props.id);
    setDeleted(true);
  };

  const setBcf = () => {
    props.onClick(props.id);
  };

  if (deleted) {
    return null;
  }
  return (
    <React.Fragment>
      <ListItem>
        <Grid container spacing={0} alignItems="center" justify="center">
          <Grid
            className="d-flex align-items-center justify-content-center"
            item
            xs={true}
          >
            <img alt="" style={{ maxWidth: "100%" }} src={img} />
          </Grid>
          <Grid
            className="d-flex align-items-center justify-content-center"
            item
            xs={"auto"}
          >
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ flexDirection: "column" }}
            >
              <IconButton onClick={setBcf}>
                <DoubleArrowIcon />
              </IconButton>
              <IconButton onClick={handleClick}>
                <GetAppIcon />
              </IconButton>
              <IconButton onClick={deleteBcf} color="secondary">
                <DeleteIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <StyledMenuItemButton
                  label="Descargar como PDF"
                  onClick={downloadPdf}
                  icon={<FaFilePdf style={{ width: "24px", height: "24px" }} />}
                />

                <StyledMenuItemButton
                  label="Descargar como JSON"
                  onClick={downloadJson}
                  icon={<SiJson style={{ width: "24px", height: "24px" }} />}
                />
              </Menu>
            </div>
          </Grid>
        </Grid>
      </ListItem>
      <Divider />
    </React.Fragment>
  );
};

export default BCF;
