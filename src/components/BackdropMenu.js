import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const BackdropMenu = (props) => {
  const classes = useStyles();
  const open = props.open;
  const handleClose = props.handleClose;
  const title = props.title;
  const disabled = props.disabled;
  const okButton = props.okButton;
  const className = props.className;

  return (
    <Backdrop className={classes.backdrop} open={open}>
      <Dialog open={open} onClose={handleClose} className={className}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{props.children}</DialogContent>
        <DialogActions>
          <Button disabled={disabled} onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button
            disabled={okButton.disabled || disabled}
            onClick={okButton.onClick}
            color="primary"
            variant="contained"
          >
            {okButton.label}
          </Button>
        </DialogActions>
      </Dialog>
    </Backdrop>
  );
};

export default BackdropMenu;
