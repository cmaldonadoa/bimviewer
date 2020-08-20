import React from "react";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import ListItem from "@material-ui/core/ListItem";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import DeleteIcon from "@material-ui/icons/Delete";

const BCF = (props) => {
  const [deleted, setDeleted] = React.useState(false);
  const img = props.img;

  const deleteBCF = () => {
    props.onDelete(props.id);
    setDeleted(true);
  };

  const setBCF = () => {
    props.onClick(props.id);
  };

  if (deleted) {
    return null;
  }
  return (
    <React.Fragment>
      <ListItem>
        <ListItemIcon>
          <IconButton onClick={deleteBCF} color="secondary">
            <DeleteIcon />
          </IconButton>
        </ListItemIcon>
        <img src={img} />
        <div>
          <IconButton onClick={setBCF}>
            <DoubleArrowIcon />
          </IconButton>
        </div>
      </ListItem>
      <Divider />
    </React.Fragment>
  );
};

export default BCF;
