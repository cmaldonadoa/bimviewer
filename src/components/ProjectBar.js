import React from "react";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import EditIcon from "@material-ui/icons/Edit";
import CircularProgress from "@material-ui/core/CircularProgress";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CheckCircleOutlineOutlinedIcon from "@material-ui/icons/CheckCircleOutlineOutlined";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import MaterialTable from "material-table";
import TextField from "@material-ui/core/TextField";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";

function useInterval(callback, delay) {
  const savedCallback = React.useRef();

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const Accordion = withStyles({
  root: {
    border: "1px solid rgba(0, 0, 0, .125)",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    marginBottom: -1,
    minHeight: 56,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    "&$expanded": {
      margin: "12px 0",
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    "& div": {
      width: "100%",
    },
  },
}))(MuiAccordionDetails);

const ProjectBar = (props) => {
  const [deleted, setDeleted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [models, setModels] = React.useState([]);
  const [expanded, setExpanded] = React.useState(false);
  const [request, setRequest] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(props.name);
  const [newName, setNewName] = React.useState(props.name);
  const id = props.id;
  const onAdd = props.onAdd;
  const onOpen = props.onOpen;

  const formatData = (data) => {
    return data.info.map((model) => {
      return {
        id: model.id,
        tag: model.tag,
        name: model.name,
        filename: model.original_name,
        loading: model.loading,
        status: model.error ? (
          <div
            className="d-flex align-items-center"
            style={{ color: "#f50057" }}
          >
            <ErrorOutlineIcon fontSize="small" />{" "}
            <span className="ml-2">Error</span>
          </div>
        ) : model.loading ? (
          <div className="d-flex align-items-center">
            <CircularProgress style={{ margin: 2 }} color="action" size={16} />
            <span className="ml-2">Cargando</span>
          </div>
        ) : (
          <div
            className="d-flex align-items-center"
            style={{ color: "#20e43b" }}
          >
            <CheckCircleOutlineOutlinedIcon fontSize="small" />{" "}
            <span className="ml-2">Listo</span>
          </div>
        ),
      };
    });
  };

  React.useEffect(() => {
    if (!loading) {
      setRequest(true);
    }
  });

  useInterval(() => {
    if (request) {
      fetch(`https://bimapi.velociti.cl/dev_get_projects/${id}/info`, {
        headers: {
          Authorization: "public_auth",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const oldLoading = models.filter((model) => model.loading);
          const newLoading = data.info.filter((model) => model.loading);
          if (
            models.length !== data.info.length ||
            oldLoading.length !== newLoading.length
          ) {
            const info = formatData(data);
            setModels(info);
          }
        })
        .catch((err) => console.error(err));
    }
  }, 5000);

  const handleExpand = (newState) => {
    setExpanded(newState);
    if (newState) {
      fetch(`https://bimapi.velociti.cl/dev_get_projects/${id}/info`, {
        headers: {
          Authorization: "public_auth",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const info = formatData(data);
          setLoading(false);
          setModels(info);
        })
        .catch((err) => console.error(err));
    } else {
      setLoading(true);
      setRequest(false);
    }
  };

  if (deleted) {
    return null;
  }
  return (
    <Accordion expanded={expanded} onChange={() => handleExpand(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex align-items-center">
            {editing ? (
              <React.Fragment>
                <TextField
                  label="Nombre del proyecto"
                  value={newName}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => setNewName(event.target.value)}
                />
                <IconButton
                  className="ml-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    setName(newName);
                    setEditing(false);
                  }}
                >
                  <CheckIcon color="action" fontSize="small" />
                </IconButton>
                <IconButton
                  className="ml-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    setEditing(false);
                  }}
                >
                  <CloseIcon color="action" fontSize="small" />
                </IconButton>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <h5>{name}</h5>
                <IconButton
                  className="ml-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    setEditing(true);
                  }}
                >
                  <EditIcon color="action" fontSize="small" />
                </IconButton>
              </React.Fragment>
            )}
          </div>
          <div
            className="d-flex justify-content-around"
            style={{ width: "120px" }}
          >
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                onAdd(() => handleExpand(true));                
              }}
            >
              <AddCircleIcon />
            </IconButton>
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                onOpen();
              }}
            >
              <OpenInNewIcon />
            </IconButton>
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <MaterialTable
          title=""
          isLoading={loading}
          columns={[
            {
              field: "tag",
              title: "Tipo",
              lookup: { ARC: "ARC", STR: "STR", MEP: "MEP" },
            },
            {
              field: "name",
              title: "Nombre",
            },
            {
              field: "filename",
              title: "Archivo",
              editable: "never",
            },
            {
              field: "status",
              title: "Estado",
              editable: "never",
              sorting: false,
            },
          ]}
          data={models}
          editable={{
            onRowDelete: (oldData) => {
              const id = oldData.id;
              return fetch(`https://bimapi.velociti.cl/dev_model/${id}`, {
                method: "DELETE",
                headers: {
                  Authorization: "public_auth",
                },
              })
                .then((res) => res.json())
                .then((data) => {
                  const index = oldData.tableData.id;
                  let newModels = models;
                  delete newModels[index];
                  newModels = newModels.filter((model) => Boolean(model));
                  setModels(newModels);
                })
                .catch((err) => console.error(err));
            },
          }}
          cellEditable={{
            cellStyle: {},
            onCellEditApproved: (newValue, oldValue, rowData, columnDef) => {
              const field = columnDef.field;
              let formData = new FormData();
              formData.append(field, newValue);
              formData.append("id", rowData.id);

              return fetch(`https://bimapi.velociti.cl/dev_patch_model`, {
                method: "POST",
                headers: {
                  Authorization: "public_auth",
                },
                body: formData,
              })
                .then((res) => res.json())
                .then((data) => {
                  const index = rowData.tableData.id;
                  let newModels = models;
                  let model = newModels[index];
                  model[field] = newValue;
                  newModels[index] = model;
                  setModels(newModels);
                })
                .catch((err) => console.error(err));
            },
          }}
          options={{
            toolbar: false,
            showTitle: false,
            paging: false,
            actionsColumnIndex: 4,
          }}
          localization={{
            header: {
              actions: "Acciones",
            },
            body: {
              deleteTooltip: "Eliminar",
              editTooltip: "Editar",
              emptyDataSourceMessage:
                "No se han cargado modelos a este proyecto.",
              editRow: {
                deleteText: "¿Desea eliminar este modelo?",
                cancelTooltip: "Cancelar",
                saveTooltip: "Continuar",
              },
            },
          }}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default ProjectBar;
