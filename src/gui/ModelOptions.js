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
  const [viewAlignment, setViewAlignment] = React.useState("perspective");
  const [navigationAlignment, setNavigationAlignment] = React.useState("orbit");
  const [storey, setStorey] = React.useState("");
  const [fpState, setFpState] = React.useState(false);
  const [minimapState, setMinimapState] = React.useState(true);

  const handleStoreyChange = (event) => {
    let newStorey = event.target.value;
    setStorey(newStorey);
    props.setStorey(newStorey)
  };

  const handleFpChange = (event) => {
    setFpState(!fpState);
    props.toggleFirstPerson(!fpState);
  };

  const handleMinimapChange = (event) => {
    setMinimapState(!fpState);
  };

  const handleViewAlignment = (event, newAlignment) => {
    setViewAlignment(newAlignment);
    props.setProjection(newAlignment);
  };

  const handleNavigationAlignment = (event, newAlignment) => {
    setNavigationAlignment(newAlignment);
  };

  return (
    <div className={classes.root}>
      <List component="nav" aria-label="model options">
        <ListItem>
          <ListItemText primary="Navegación" />
          <ListItemIcon>
            <ToggleButtonGroup
              value={navigationAlignment}
              exclusive
              onChange={handleNavigationAlignment}
              aria-label="text alignment"
            >
              <ToggleButton value="orbit" aria-label="left aligned">
                Órbita
              </ToggleButton>
              <ToggleButton value="pan" aria-label="center aligned">
                Paneo
              </ToggleButton>
              <ToggleButton value="zoom" aria-label="right aligned">
                Zoom
              </ToggleButton>
            </ToggleButtonGroup>
          </ListItemIcon>
        </ListItem>

        <ListItem>
          <ListItemText primary="Vista" />
          <ListItemIcon>
            <ToggleButtonGroup
              value={viewAlignment}
              exclusive
              onChange={handleViewAlignment}
              aria-label="text alignment"
            >
              <ToggleButton value="perspective" aria-label="left aligned">
                Perspectiva
              </ToggleButton>
              <ToggleButton value="ortho" aria-label="right aligned">
                Ortogonal
              </ToggleButton>
            </ToggleButtonGroup>
          </ListItemIcon>
        </ListItem>

        <ListItem>
          <ListItemText primary="Minimapa" />
          <Switch
            checked={minimapState}
            onChange={handleMinimapChange}
            color="primary"
            inputProps={{ "aria-label": "primary checkbox" }}
          />
        </ListItem>

        <ListItem>
          <ListItemText primary="Primera Persona" />
          <Switch
            checked={fpState}
            onChange={handleFpChange}
            color="primary"
            inputProps={{ "aria-label": "primary checkbox" }}
          />
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
          <ListItemText primary="Añadir anotación" />
        </ListItem>

        <ListItem button>
          <ListItemText primary="Crear plano de sección" />
        </ListItem>

        <ListItem button>
          <ListItemText primary="Medir" />
        </ListItem>

        <ListItem button>
          <ListItemText primary="Ajustar a la pantalla" />
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
