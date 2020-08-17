import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import { FaFileExcel, FaFilePdf, FaFileImage } from "react-icons/fa";
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
import { Typography } from "@material-ui/core";

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
  const [openStorey, setOpenStorey] = React.useState(false);
  const [storeyModelType, setStoreyModelType] = React.useState("");
  const [storeyModel, setStoreyModel] = React.useState("");
  const [storey, setStorey] = React.useState("");
  const [fpState, setFpState] = React.useState(false);
  const [borderState, setBorderState] = React.useState(true);
  const [openAnnotations, setOpenAnnotations] = React.useState(false);
  const [openMeasurements, setOpenMeasurements] = React.useState(false);
  const [openSectionPlanes, setOpenSectionPlanes] = React.useState(false);
  const setOpen = props.secondDrawer.setOpen;
  const setContent = props.secondDrawer.setContent;
  const tools = props.tools;

  const handleOpenAnnotations = () => {
    setOpenAnnotations(!openAnnotations);
  };

  const handleOpenMeasurements = () => {
    setOpenMeasurements(!openMeasurements);
  };

  const handleOpenSectionPlanes = () => {
    setOpenSectionPlanes(!openSectionPlanes);
  };

  const handleOpenStorey = () => {
    setOpenStorey(!openStorey);
  };

  const handleStoreyChange = (event) => {
    let newStorey = event.target.value;
    setStorey(newStorey);
    tools.setStorey(newStorey);
  };

  const handleStoreyModelChange = (event) => {
    let newModel = event.target.value;
    setStoreyModel(newModel);
    if (!newModel) {
      setStorey("");
      tools.setStorey("");
    }
  };

  const handleFpChange = (event) => {
    setFpState(!fpState);
    tools.setFirstPerson(!fpState);
  };

  const handleBorderState = (event) => {
    setBorderState(!borderState);
    tools.setEdges(!borderState);
  };

  const handleViewChange = (event, newView) => {
    if (newView) {
      setView(newView);
      tools.setProjection(newView);
    }
  };

  const handleControlChange = (event, newControl) => {
    if (newControl) {
      setControl(newControl);
      tools.setCameraMode(newControl);
    }
  };

  const openDrawer = (content) => {
    setOpen(true);
    setContent(content);
  };

  return (
    <div className={classes.root}>
      <List component="nav">
        <StyledListItemToggleButton
          label={"Control"}
          value={control}
          exclusive={true}
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
          exclusive={true}
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

        <StyledListItemSwitch
          label="Bordes"
          checked={borderState}
          onChange={handleBorderState}
        />

        <Divider />

        <StyledListItemAccordion
          label={"Ver piso"}
          open={openStorey}
          onClick={handleOpenStorey}
        >
          <StyledListItemSelect
            label="Modelo"
            onChange={handleStoreyModelChange}
            value={storeyModel}
            className={classes.nested}
            options={Object.keys(props.storeys).map((modelId) => ({
              value: modelId,
              label: tools.getModelName(modelId),
            }))}
          />

          <StyledListItemSelect
            label="Piso"
            onChange={handleStoreyChange}
            value={storey}
            className={classes.nested}
            options={
              storeyModel
                ? props.storeys[storeyModel].map((storey) => ({
                    value: storey.id,
                    label: storey.name,
                  }))
                : []
            }
          />
        </StyledListItemAccordion>
        <StyledListItemAccordion
          label={"Anotaciones"}
          open={openAnnotations}
          onClick={handleOpenAnnotations}
        >
          <StyledListItemButton
            icon={<AddIcon />}
            label="Añadir"
            onClick={() => tools.createAnnotations()}
            className={classes.nested}
          />
          <StyledListItemButton
            icon={<EditIcon />}
            label="Editar"
            onClick={() =>
              openDrawer(
                <List className={classes.denseList} dense>
                  {props.annotations.length === 0 ? (
                    <Typography className="p-3">No hay anotaciones.</Typography>
                  ) : (
                    props.annotations.map((annotation, index) =>
                      annotation ? (
                        <Annotation
                          key={annotation.id}
                          onDelete={tools.destroyAnnotation}
                          onSave={tools.saveAnnotation}
                          onCheck={tools.toggleAnnotation}
                          id={index}
                          name={annotation.name}
                          description={annotation.description}
                        />
                      ) : null
                    )
                  )}
                </List>
              )
            }
            className={classes.nested}
          />
          <StyledListItemButton
            icon={<SaveIcon />}
            label="Guardar"
            onClick={() => tools.saveAnnotations()}
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
            onClick={() => tools.createSectionPlane()}
            className={classes.nested}
          />
          <StyledListItemButton
            icon={<DeleteIcon />}
            label="Eliminar seleccionado"
            onClick={() => tools.destroySectionPlane()}
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
            onClick={() => tools.measureDistance()}
            className={classes.nested}
          />
          <StyledListItemButton
            icon={<DeleteIcon />}
            label="Eliminar todo"
            onClick={() => tools.clearMeasurements()}
            className={classes.nested}
          />
        </StyledListItemAccordion>

        <StyledListItemButton
          label="Ajustar a la pantalla"
          onClick={() => tools.fitModel()}
        />

        <StyledListItemButton
          label="Mostrar todo"
          onClick={() => tools.showAll()}
        />

        <Divider />

        <StyledListItemButton
          label="Descargar como PDF"
          onClick={() => tools.downloadPDF()}
          icon={<FaFilePdf style={{ width: "24px", height: "24px" }} />}
        />

        <StyledListItemButton
          label="Descargar como PNG"
          onClick={() => tools.takeSnapshot()}
          icon={<FaFileImage style={{ width: "24px", height: "24px" }} />}
        />

        <StyledListItemButton
          label="Descargar como XLSX"
          onClick={() => tools.downloadExcel()}
          icon={<FaFileExcel style={{ width: "24px", height: "24px" }} />}
        />
      </List>
    </div>
  );
};

export default SidebarOptions;
