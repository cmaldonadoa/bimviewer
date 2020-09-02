import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import { FaFileExcel, FaFilePdf, FaFileImage } from "react-icons/fa";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
import StorageIcon from "@material-ui/icons/Storage";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import AddIcon from "@material-ui/icons/Add";
import {
  StyledListItemButton,
  StyledListItemToggleButton,
  StyledListItemSwitch,
  StyledListItemSelect,
  StyledListItemAccordion,
  StyledListItemSlider,
} from "../components/StyledListItem";
import BackdropMenu from "../components/BackdropMenu";
import Annotation from "../components/Annotation";
import BCF from "../components/BCF";
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
  excelMenu: {
    "& div .MuiDialog-paperScrollPaper": {
      width: 400,
    },
  },
}));

const SidebarOptions = (props) => {
  const classes = useStyles();
  const [view, setView] = React.useState("perspective");
  const [control, setControl] = React.useState("orbit");
  const [zoomRatio, setZoomRatio] = React.useState(0.2);
  const [openStorey, setOpenStorey] = React.useState(false);
  const [storeyModelType, setStoreyModelType] = React.useState("");
  const [storeyModel, setStoreyModel] = React.useState("");
  const [storey, setStorey] = React.useState("");
  const [fpState, setFpState] = React.useState(false);
  const [borderState, setBorderState] = React.useState(true);
  const [openMeasurements, setOpenMeasurements] = React.useState(false);
  const [openSectionPlanes, setOpenSectionPlanes] = React.useState(false);
  const [openBcf, setOpenBcf] = React.useState(false);
  const [openExcelMenu, setOpenExcelMenu] = React.useState(false);
  const [excelModelType, setExcelModelType] = React.useState("ARC");
  const [excelModel, setExcelModel] = React.useState("");
  const [disableSaveAnnotation, setDisableSaveAnnotation] = React.useState(
    false
  );
  const { setOpen, setContent, setTitle, setOnClose } = props.secondDrawer;
  const tools = props.tools;

  const annotationsContent = React.useCallback(
    () => (
      <List className={classes.denseList} dense>
        {props.annotations.filter((x) => Boolean(x)).length === 0 ? (
          <React.Fragment>
            <Typography className="p-3">No hay anotaciones.</Typography>
            <Divider />
          </React.Fragment>
        ) : (
          props.annotations.map((annotation, index) =>
            annotation ? (
              <Annotation
                key={annotation.id}
                onDelete={tools.destroyAnnotation}
                onSave={tools.saveAnnotation}
                onCheck={tools.toggleAnnotation}
                onReply={tools.saveReply}
                onFly={tools.flyToAnnotation}
                onEdit={(val) => setDisableSaveAnnotation(val)}
                id={index}
                name={annotation.name}
                description={annotation.description}
                responsible={annotation.responsible}
                specialty={annotation.specialty}
                date={annotation.date}
                replies={annotation.replies}
                final={props.isBcfLoaded}
              />
            ) : null
          )
        )}
        {props.isBcfLoaded ? null : (
          <div className="p-3">
            <Button
              disableElevation
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AddIcon />}
              onClick={tools.createAnnotations}
            >
              Nueva
            </Button>
            <Button
              disabled={disableSaveAnnotation}
              disableElevation
              className="ml-3"
              variant="contained"
              color="primary"
              size="small"
              startIcon={<SaveIcon />}
              onClick={() => {
                tools.saveBcf();
                setOpen(false);
                props.clearBcf();
              }}
            >
              Guardar
            </Button>
          </div>
        )}
      </List>
    ),
    [classes.denseList, disableSaveAnnotation, props, setOpen, tools]
  );

  React.useEffect(() => {
    setTitle((prevTitle) => "Anotaciones");
    setContent((prevContent) => annotationsContent());
  }, [props.annotations, setContent, setTitle]);

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
    setStorey("");

    if (!newModel) {
      tools.setStorey("");
    }
  };

  const handleStoreyModelTypeChange = (event) => {
    let newType = event.target.value;
    setStoreyModelType(newType);
    setStorey("");
    setStoreyModel("");

    if (!newType) {
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

  const openDrawer = (title, content, onClose) => {
    setOpen(true);
    setTitle(title);
    setContent(content);
    setOnClose(onClose);
  };

  const handleOpenExcelMenu = () => {
    setOpenExcelMenu(!openExcelMenu);
  };

  const handleExcelModelTypeChange = (event, newType) => {
    setExcelModelType(newType);
    setExcelModel("");
  };

  const handleExcelModelChange = (event) => {
    setExcelModel(event.target.value);
  };

  const handleExcelDownload = () => {
    tools.downloadExcel(excelModelType, excelModel);
    handleOpenExcelMenu();
  };

  const handleOpenBcf = () => {
    setOpenBcf(!openBcf);
  };

  const handleZoomRatioChange = (event, value) => {
    setZoomRatio(value);
    tools.setZoom(value);
  };

  const getBcfId = (index) => {
    let num = "" + (index + 1);
    while (num.length < 4) num = "0" + num;
    return "OBS-" + num;
  };

  return (
    <div className={classes.root}>
      <List component="nav">
        <StyledListItemToggleButton
          label={"Control"}
          value={control}
          exclusive
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

        {control === "zoom" ? (
          <StyledListItemSlider
            label="Sensibilidad zoom"
            value={zoomRatio}
            onChange={handleZoomRatioChange}
            min={0}
            max={0.5}
            step={0.01}
          />
        ) : null}

        <StyledListItemToggleButton
          label={"Vista"}
          value={view}
          onChange={handleViewChange}
          exclusive
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
          label="Primera persona"
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
            label="Tipo"
            onChange={handleStoreyModelTypeChange}
            value={storeyModelType}
            className={classes.nested}
            options={[
              {
                label: "ARC",
                value: "ARC",
              },
              {
                label: "STR",
                value: "STR",
              },
              {
                label: "MEP",
                value: "MEP",
              },
            ]}
          />

          <StyledListItemSelect
            label="Modelo"
            onChange={handleStoreyModelChange}
            value={storeyModel}
            className={classes.nested}
            options={
              storeyModelType
                ? Object.keys(props.storeys[storeyModelType]).map(
                    (modelId) => ({
                      value: modelId,
                      label: tools.getModelMeta(modelId).name,
                    })
                  )
                : []
            }
          />

          <StyledListItemSelect
            label="Piso"
            onChange={handleStoreyChange}
            value={storey}
            className={classes.nested}
            options={
              storeyModel
                ? props.storeys[storeyModelType][storeyModel].map((storey) => ({
                    value: storey.id,
                    label: storey.name,
                  }))
                : []
            }
          />
        </StyledListItemAccordion>

        <StyledListItemAccordion
          label={"Planos de sección"}
          open={openSectionPlanes}
          onClick={handleOpenSectionPlanes}
        >
          <StyledListItemButton
            icon={<AddCircleIcon />}
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
            icon={<AddCircleIcon />}
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

        <StyledListItemAccordion
          label={"Observaciones"}
          open={openBcf}
          onClick={handleOpenBcf}
        >
          <StyledListItemButton
            icon={<AddCircleIcon />}
            label="Crear"
            onClick={() =>
              openDrawer("Anotaciones", annotationsContent(), {
                title: "Atención",
                description:
                  "Al cerrar esta pestaña se perderán las anotaciones que no se hayan guardado.",
              })
            }
            className={classes.nested}
          />
          <StyledListItemButton
            icon={<StorageIcon />}
            label="Ver guardados"
            onClick={() =>
              openDrawer(
                "Observaciones",
                <List className={classes.denseList} dense>
                  {props.bcf.filter((x) => Boolean(x)).length === 0 ? (
                    <Typography className="p-3">
                      No hay observaciones.
                    </Typography>
                  ) : (
                    <React.Fragment>
                      <div className="p-3">
                        <Button
                          disableElevation
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={tools.downloadAllBcf}
                        >
                          Descargar todo
                        </Button>
                      </div>
                      {props.bcf.map((viewpoint, index) =>
                        viewpoint ? (
                          <BCF
                            key={index}
                            data={viewpoint.bcf}
                            name={`${props.project}`}
                            img={viewpoint.bcf.snapshot.snapshot_data}
                            onDelete={tools.destroyBcf}
                            onSelect={tools.loadBcf}
                            onDownload={tools.downloadBcf}
                            index={index}
                            id={getBcfId(index)}
                          />
                        ) : null
                      )}
                    </React.Fragment>
                  )}
                </List>
              )
            }
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
          onClick={() => tools.downloadPdf()}
          icon={<FaFilePdf style={{ width: "24px", height: "24px" }} />}
        />

        <StyledListItemButton
          label="Descargar como PNG"
          onClick={() => tools.takeSnapshot()}
          icon={<FaFileImage style={{ width: "24px", height: "24px" }} />}
        />

        <StyledListItemButton
          label="Descargar como XLSX"
          onClick={() => handleOpenExcelMenu()}
          icon={<FaFileExcel style={{ width: "24px", height: "24px" }} />}
        />
        <BackdropMenu
          title="Descargar XLSX"
          open={openExcelMenu}
          okButton={{
            label: "Descargar",
            onClick: () => handleExcelDownload(),
            disabled: !excelModel,
          }}
          handleClose={handleOpenExcelMenu}
          className={classes.excelMenu}
        >
          <StyledListItemToggleButton
            label={"Tipo"}
            value={excelModelType}
            onChange={handleExcelModelTypeChange}
            exclusive
            options={[
              {
                label: "ARC",
                value: "ARC",
              },
              {
                label: "STR",
                value: "STR",
              },
              {
                label: "MEP",
                value: "MEP",
              },
            ]}
          />
          <StyledListItemSelect
            label="Modelo"
            onChange={handleExcelModelChange}
            value={excelModel}
            options={tools.getModelsByType(excelModelType).map((model) => ({
              value: model.meta.id,
              label: model.meta.name,
            }))}
          />
        </BackdropMenu>
      </List>
    </div>
  );
};

export default SidebarOptions;
