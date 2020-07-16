import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
import {
  StyledListItemButton,
  StyledListItemToggleButton,
  StyledListItemSwitch,
  StyledListItemSelect,
  StyledListItemAccordion,
} from "../components/StyledListItem";
import Annotation from "../components/Annotation";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  denseList: {
    paddingTop: 0,
    paddingBottom: 0,
  },
}));

const SidebarOptions = (props) => {
  const classes = useStyles();
  const [view, setView] = React.useState("perspective");
  const [control, setControl] = React.useState("orbit");
  const [storey, setStorey] = React.useState("");
  const [fpState, setFpState] = React.useState(false);
  const [openAnotations, setOpenAnotations] = React.useState(false);
  const [openMeasurements, setOpenMeasurements] = React.useState(false);
  const [openSectionPlanes, setOpenSectionPlanes] = React.useState(false);
  const setOpen = props.secondDrawer.setOpen;
  const setContent = props.secondDrawer.setContent;

  const handleOpenAnotations = () => {
    setOpenAnotations(!openAnotations);
  };

  const handleOpenMeasurements = () => {
    setOpenMeasurements(!openMeasurements);
  };

  const handleOpenSectionPlanes = () => {
    setOpenSectionPlanes(!openSectionPlanes);
  };

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

  const openDrawer = (content) => {
    setOpen(true);
    setContent(content);
  };

  const closeDrawer = () => {
    setOpen(true);
    setContent(null);
  };

  return (
    <div className={classes.root}>
      <List component="nav">
        <StyledListItemToggleButton
          label={"Control"}
          value={control}
          onChange={handleControlChange}
          options={[
            {
              label: "Órbita",
              value: "orbit",
            },
            {
              label: "Paneo",
              value: "pan",
            },
            {
              label: "Zoom",
              value: "zoom",
            },
          ]}
        />

        <StyledListItemToggleButton
          label={"Vista"}
          value={view}
          onChange={handleViewChange}
          options={[
            {
              label: "Perspectiva",
              value: "perspective",
            },
            {
              label: "Ortogonal",
              value: "ortho",
            },
          ]}
        />

        <StyledListItemSwitch
          label="Primera Persona"
          checked={fpState}
          onChange={handleFpChange}
        />

        <Divider />

        <StyledListItemSelect
          label="Ver Piso"
          onChange={handleStoreyChange}
          value={storey}
          options={props.storeys.map((storey) => ({
            value: storey.id,
            label: storey.name,
          }))}
        />

        <StyledListItemAccordion
          label={"Anotaciones"}
          open={openAnotations}
          onClick={handleOpenAnotations}
        >
          <StyledListItemButton
            icon={<AddIcon />}
            label="Añadir"
            onClick={() => props.createAnnotations()}
            className={classes.nested}
          />
          <StyledListItemButton
            icon={<EditIcon />}
            label="Editar"
            onClick={() =>
              openDrawer(
                <List className={classes.denseList} dense>
                  <Annotation
                    name="Sin título 1"
                    description="No description"
                  />
                  <Annotation
                    name="Sin título 2"
                    description="No description"
                  />
                  <Annotation
                    name="Sin título 3"
                    description="No description"
                  />
                </List>
              )
            }
            className={classes.nested}
          />
          <StyledListItemButton
            icon={<SaveIcon />}
            label="Guardar"
            onClick={() => {}}
            className={classes.nested}
          />
        </StyledListItemAccordion>

        <StyledListItemAccordion
          label={"Planos de Sección"}
          open={openSectionPlanes}
          onClick={handleOpenSectionPlanes}
        >
          <StyledListItemButton
            icon={<AddIcon />}
            label="Añadir"
            onClick={() => props.createSectionPlane()}
            className={classes.nested}
          />
          <StyledListItemButton
            icon={<DeleteIcon />}
            label="Eliminar"
            onClick={() => {}}
            className={classes.nested}
          />
        </StyledListItemAccordion>

        <StyledListItemAccordion
          label={"Mediciones"}
          open={openMeasurements}
          onClick={handleOpenMeasurements}
        >
          <StyledListItemButton
            icon={<AddIcon />}
            label="Añadir"
            onClick={() => props.measureDistance()}
            className={classes.nested}
          />
          <StyledListItemButton
            icon={<DeleteIcon />}
            label="Eliminar"
            onClick={() => {}}
            className={classes.nested}
          />
        </StyledListItemAccordion>

        <StyledListItemButton
          label="Ajustar a la pantalla"
          onClick={() => props.fitModel()}
        />

        <StyledListItemButton label="Mostar todo" onClick={() => {}} />

        <Divider />

        <StyledListItemButton
          label="Descargar como PDF"
          onClick={() => {}}
          icon={<FaFilePdf style={{ width: "24px", height: "24px" }} />}
        />

        <StyledListItemButton
          label="Descargar como XLSX"
          onClick={() => {}}
          icon={<FaFileExcel style={{ width: "24px", height: "24px" }} />}
        />
      </List>
    </div>
  );
};

export default SidebarOptions;
