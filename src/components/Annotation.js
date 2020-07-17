import React from "react";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import ListItem from "@material-ui/core/ListItem";
import IconButton from "@material-ui/core/IconButton";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';

const Annotation = (props) => {
  const [name, setName] = React.useState(props.name);
  const [visible, setVisible] = React.useState(true);
  const [savedName, setSavedName] = React.useState(props.name);
  const [description, setDescription] = React.useState(props.description);
  const [savedDescription, setSavedDescription] = React.useState(
    props.description
  );
  const [editing, setEditing] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);

  const deleteAnnotation = () => {
    props.onDelete(props.id)
    setDeleted(true)
  };

  const onChange = () => {
    setVisible(!visible)
    props.onCheck(props.id)
  }

  const editAnnotation = () => {
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setName(savedName);
    setDescription(savedDescription);
  };

  const saveEdit = () => {
    props.onSave(props.id, name, description)
    setEditing(false);
    setSavedName(name);
    setSavedDescription(description);    
  };

  if (deleted) {
    return null;
  } else if (editing) {
    return (
      <React.Fragment>
        <ListItem>
          <Grid justify="center" className="py-3" container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                onChange={(event) => setName(event.target.value)}
                fullWidth
                label="Nombre"
                value={name}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                onChange={(event) => setDescription(event.target.value)}
                variant="outlined"
                label="Descripción"
                multiline
                rows={4}
                value={description}
              />
            </Grid>

            <Grid container item xs={12} spacing={2} justify="flex-end">
              <Grid item>
                <Button
                  onClick={cancelEdit}
                  disableElevation
                  variant="contained"
                  size="small"
                >
                  Cancelar
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={saveEdit}
                  disableElevation
                  variant="contained"
                  size="small"
                  color="primary"
                >
                  Guardar
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </ListItem>
        <Divider />
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <ListItem>
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={visible}
            disableRipple
            color="primary"
            onChange={onChange}
          />
        </ListItemIcon>
        <ListItemText primary={savedName} />
        <div>
          <IconButton onClick={editAnnotation}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={deleteAnnotation} color="secondary">
            <DeleteIcon />
          </IconButton>
        </div>
      </ListItem>
      <Divider />
    </React.Fragment>
  );
};

export default Annotation;
