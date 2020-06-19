import React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Switch from "@material-ui/core/Switch";
import Select from "@material-ui/core/Select";
import Divider from "@material-ui/core/Divider";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 220,
  },
}));

export default function ModelOptions(props) {
  const classes = useStyles();
  const [view, setView] = React.useState("perspective");
  const [control, setControl] = React.useState("orbit");
  const [storey, setStorey] = React.useState("");
  const [fpState, setFpState] = React.useState(false);

  const handleStoreyChange = (event) => {
    let newStorey = event.target.value;
    setStorey(newStorey);
    props.setStorey(newStorey);
  };

  const handleFpChange = (event) => {
    setFpState(!fpState);
    props.toggleFirstPerson(!fpState);
  };

  const handleViewChange = (event, newView) => {
    if (newView) {
      setView(newView);
      props.setProjection(newView);
    }
  };

  const handleControlChange = (event, newControl) => {
    if (newControl) {
      setControl(newControl);
      props.setCameraMode(newControl);
    }
  };

  return (
    <div className={classes.root}>
      <List component="nav">
        <ListItem>
          <ListItemText primary="Control" />
          <ListItemIcon>
            <ToggleButtonGroup
              value={control}
              exclusive
              onChange={handleControlChange}
            >
              <ToggleButton value="orbit">Órbita</ToggleButton>
              <ToggleButton value="pan">Paneo</ToggleButton>
              <ToggleButton value="zoom">Zoom</ToggleButton>
            </ToggleButtonGroup>
          </ListItemIcon>
        </ListItem>

        <ListItem>
          <ListItemText primary="Vista" />
          <ListItemIcon>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={handleViewChange}
            >
              <ToggleButton value="perspective">Perspectiva</ToggleButton>
              <ToggleButton value="ortho">Ortogonal</ToggleButton>
            </ToggleButtonGroup>
          </ListItemIcon>
        </ListItem>

        <ListItem>
          <ListItemText primary="Primera Persona" />
          <Switch checked={fpState} onChange={handleFpChange} color="primary" />
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemText primary="Storey" />
          <FormControl className={classes.formControl}>
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              value={storey}
              displayEmpty
              onChange={handleStoreyChange}
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {props.storeys.map((storey, idx) => (
                <MenuItem key={idx} value={storey.id}>
                  {storey.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ListItem>

        <ListItem button>
          <ListItemText
            primary="Añadir anotación"
            onClick={() => props.createAnnotations()}
          />
        </ListItem>

        <ListItem button>
          <ListItemText
            primary="Crear plano de sección"
            onClick={() => props.createSectionPlane()}
          />
        </ListItem>

        <ListItem button>
          <ListItemText
            primary="Medir"
            onClick={() => props.measureDistance()}
          />
        </ListItem>

        <ListItem button>
          <ListItemText
            primary="Ajustar a la pantalla"
            onClick={() => props.fitModel()}
          />
        </ListItem>

        <ListItem button>
          <ListItemText primary="Mostar todo" />
        </ListItem>

        <Divider />

        <ListItem button>
          <ListItemIcon>
            <FaFilePdf style={{ width: "24px", height: "24px" }} />
          </ListItemIcon>
          <ListItemText primary="Descargar como PDF" />
        </ListItem>

        <ListItem button>
          <ListItemIcon>
            <FaFileExcel style={{ width: "24px", height: "24px" }} />
          </ListItemIcon>
          <ListItemText primary="Descargar como XLSX" />
        </ListItem>
      </List>
    </div>
  );
}
