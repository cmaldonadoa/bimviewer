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
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Checkbox from "@material-ui/core/Checkbox";
import InfoIcon from "@material-ui/icons/Info";
import Typography from "@material-ui/core/Typography";

const TextDisplay = (props) => {
  const name = props.name;
  const value = props.value;

  return (
    <Typography>
      {name}: {value}
    </Typography>
  );
};

const Annotation = (props) => {
  const date = props.date ? props.date.toLocaleString() : null;
  const replies = props.replies;
  const final = props.final;
  const [name, setName] = React.useState(props.name);
  const [visible, setVisible] = React.useState(true);
  const [savedName, setSavedName] = React.useState(props.name);
  const [description, setDescription] = React.useState(props.description);
  const [savedDescription, setSavedDescription] = React.useState(
    props.description
  );
  const [responsible, setResponsible] = React.useState(props.responsible);
  const [savedResponsible, setSavedResponsible] = React.useState(
    props.responsible
  );
  const [specialty, setSpecialty] = React.useState(props.specialty);
  const [savedSpecialty, setSavedSpecialty] = React.useState(props.specialty);
  const [editing, setEditing] = React.useState(!final);
  const [deleted, setDeleted] = React.useState(false);
  const [replying, setReplying] = React.useState(false);
  const [author, setAuthor] = React.useState("");
  const [comment, setComment] = React.useState("");

  React.useEffect(() => {
    props.onEdit(true);
  }, [props]);

  const deleteAnnotation = () => {
    props.onDelete(props.id);
    setDeleted(true);
  };

  const onChange = () => {
    setVisible(!visible);
    props.onCheck(props.id);
  };

  const editAnnotation = () => {
    setEditing(true);
    props.onEdit(true);
  };

  const flyTo = () => {
    props.onFly(props.id);
  };

  const replyAnnotation = () => {
    flyTo();
    setReplying(true);
  };

  const cancelReply = () => {
    setReplying(false);
    setAuthor("");
    setComment("");
  };

  const saveReply = () => {
    const date = new Date();
    setAuthor("");
    setComment("");
    props.onReply(props.id, { author, comment, date });
  };

  const cancelEdit = () => {
    setEditing(false);
    props.onEdit(false);
    setName(savedName);
    setDescription(savedDescription);
    setSpecialty(savedSpecialty);
    setResponsible(savedResponsible);
    if (!savedName) {
      deleteAnnotation();
    }
  };

  const saveEdit = () => {
    const date = new Date();
    setEditing(false);
    setSavedName(name);
    setSavedDescription(description);
    setSavedResponsible(responsible);
    setSavedSpecialty(specialty);
    props.onSave(props.id, { name, description, responsible, specialty, date });
    props.onEdit(false);
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
                label="Título"
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

            <Grid item xs={12}>
              <TextField
                variant="outlined"
                onChange={(event) => setResponsible(event.target.value)}
                fullWidth
                label="Responsable"
                value={responsible}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="outlined"
                onChange={(event) => setSpecialty(event.target.value)}
                fullWidth
                label="Especialidad"
                value={specialty}
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
                  disabled={!responsible || !specialty || !name || !description}
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
  } else if (replying) {
    return (
      <React.Fragment>
        <ListItem>
          <Grid justify="center" className="py-3" container spacing={2}>
            <Grid item xs={12}>
              <div className="d-flex">
                <Typography>
                  <strong>Información</strong>
                </Typography>
                <Button
                  className="position-absolute mr-3"
                  style={{ right: 0 }}
                  size="small"
                  color="primary"
                  onClick={flyTo}
                >
                  Ver
                </Button>
              </div>
            </Grid>
            <Grid item xs={12}>
              <TextDisplay name="Fecha" value={date} />
            </Grid>
            <Grid item xs={12}>
              <TextDisplay name="Título" value={name} />
            </Grid>
            <Grid item xs={12}>
              <TextDisplay name="Descripción" value={description} />
            </Grid>
            <Grid item xs={12}>
              <TextDisplay name="Responsable" value={responsible} />
            </Grid>
            <Grid item xs={12}>
              <TextDisplay name="Especialidad" value={specialty} />
            </Grid>

            <Grid item xs={12}>
              <Typography>
                <strong>Comentarios</strong>
              </Typography>
            </Grid>

            {replies.map((reply, index) => (
              <Grid key={index} item xs={12}>
                <TextDisplay
                  name={`[${reply.date.toLocaleString()}] ${reply.author}`}
                  value={reply.comment}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <TextField
                variant="outlined"
                onChange={(event) => setAuthor(event.target.value)}
                fullWidth
                label="Autor"
                value={author}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="outlined"
                onChange={(event) => setComment(event.target.value)}
                fullWidth
                label="Comentario"
                value={comment}
                rows={4}
                multiline
              />
            </Grid>

            <Grid container item xs={12} spacing={2} justify="flex-end">
              <Grid item>
                <Button
                  onClick={cancelReply}
                  disableElevation
                  variant="contained"
                  size="small"
                >
                  Cancelar
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={saveReply}
                  disableElevation
                  variant="contained"
                  size="small"
                  color="primary"
                  disabled={!author || !comment}
                >
                  Responder
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </ListItem>
        <Divider />
      </React.Fragment>
    );
  } else if (final) {
    return (
      <React.Fragment>
        <ListItem>
          <ListItemText primary={name} />
          <div>
            <IconButton onClick={replyAnnotation}>
              <InfoIcon />
            </IconButton>
          </div>
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
