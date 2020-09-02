import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Pagination from "@material-ui/lab/Pagination";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Cookies from "universal-cookie";
import { StyledListItemSelect } from "./components/StyledListItem";
import BackdropMenu from "./components/BackdropMenu";
import ProjectBar from "./components/ProjectBar";

const cookies = new Cookies();

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  menu: {
    "& div .MuiDialog-paperScrollPaper": {
      width: 400,
    },
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
  },
}));

export default function ModelUploaderProjects(props) {
  const jwt = props.auth;
  const classes = useStyles();
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [projects, setProjects] = React.useState([]);
  const [subProjects, setSubProjects] = React.useState([]);
  const [openNewProject, setOpenNewProject] = React.useState(false);
  const [openNewModel, setOpenNewModel] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");
  const [modelName, setModelName] = React.useState("");
  const [currentProject, setCurrentProject] = React.useState(-1);
  const [modelType, setModelType] = React.useState("");
  const [addModelCallback, setAddModelCallback] = React.useState(() => {})
  const size = 8;

  React.useEffect(() => {
    fetch("https://bimapi.velociti.cl/dev_get_projects", {
      method: "GET",
      headers: {
        Authorization: jwt,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status !== 200) {
          signOut();
        } else {
          let projects = res.projects.reverse();
          setProjects(projects);
          setSubProjects(projects.slice(0, size));
        }
      })
      .catch((err) => console.error(err));
  }, [jwt]);

  const handlePageChange = (event, value) => {
    setSubProjects(
      projects.slice((value - 1) * size, size + (value - 1) * size)
    );
  };

  const signOut = () => {
    cookies.remove("dev-bim-jwt", { path: "/" });
    window.location.reload();
  };

  const handleOpenNewModelMenu = (id, callback) => {
    if (!loading) {
      setOpenNewModel(!openNewModel);
      setCurrentProject(id);
      setModelName("");
      setAddModelCallback(callback)
    }
  };

  const handleOpenNewPojectMenu = () => {
    setOpenNewProject(!openNewProject);
    setProjectName("");
  };

  const handleProjectName = (event) => {
    setProjectName(event.target.value);
  };

  const handleModelName = (event) => {
    setModelName(event.target.value);
  };

  const handleModelType = (event) => {
    setModelType(event.target.value);
  };

  const selectFile = (event) => {
    setFile(event.target.files[0]);
  };

  const sendFile = (event) => {
    if (file && modelType && currentProject && modelName) {
      setLoading(true);
      var formData = new FormData();
      formData.append("bim", file);
      formData.append("tag", modelType);
      formData.append("project", currentProject);
      formData.append("name", modelName);
      fetch("https://bimapi.velociti.cl/dev_new_model", {
        method: "POST",
        headers: {
          Authorization: jwt,
        },
        body: formData,
      })
        .then((res) => res.json())
        .then((res) => {
          setLoading(false);
          handleOpenNewModelMenu();
          addModelCallback();
        })
        .catch((err) => console.error(err));
    }
  };

  const createProject = (event) => {
    var formData = new FormData();
    formData.append("name", projectName);
    fetch("https://bimapi.velociti.cl/dev_new_project", {
      method: "POST",
      headers: {
        Authorization: jwt,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        window.location.reload();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        background: "white",
        overflow: "scroll",
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            BIM Viewer v3
          </Typography>
          <Button color="inherit" onClick={handleOpenNewPojectMenu}>
            Nuevo proyecto
          </Button>
          <Button color="inherit" onClick={signOut}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <div
          style={{
            justifyContent: "center",
            display: "flex",
            height: "100vh",
            textAlign: "center",
            padding: 24,
          }}
        >
          <Grid container spacing={2} justify="center">
            {subProjects.map((project) => (
              <Grid key={project.uuid} item xs={9}>
                <ProjectBar
                  id={project.uuid}
                  name={project.name}
                  onAdd={(callback) => handleOpenNewModelMenu(project.id, callback)}
                  onOpen={() =>
                    window.open(`/development/v3/build/${project.uuid}`)
                  }
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Pagination
                className={classes.pagination}
                onChange={handlePageChange}
                count={Math.ceil(projects.length / size)}
                color="primary"
              />
            </Grid>
          </Grid>
          <BackdropMenu
            title="Nuevo modelo"
            open={openNewModel}
            disabled={loading}
            okButton={{
              label: "Cargar",
              onClick: () => sendFile(),
              disabled: !modelType || !file || !modelName,
            }}
            handleClose={handleOpenNewModelMenu}
            className={classes.menu}
          >
            <StyledListItemSelect
              label="Tipo"
              onChange={handleModelType}
              value={modelType}
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
            <div className="my-3" style={{ paddingLeft: 16, paddingRight: 16 }}>
              <input type="file" onChange={selectFile} accept=".ifc, .ifczip" />
            </div>
            <div style={{ paddingLeft: 16, paddingRight: 16 }}>
              <TextField
                onChange={handleModelName}
                fullWidth
                label="Nombre"
                value={modelName}
              />
            </div>
            <div
              className="pt-4 pb-3"
              style={loading ? {} : { display: "none" }}
            >
              <LinearProgress />
            </div>
          </BackdropMenu>
          <BackdropMenu
            title="Nuevo proyecto"
            open={openNewProject}
            okButton={{
              label: "Crear",
              onClick: () => createProject(),
              disabled: !projectName,
            }}
            handleClose={handleOpenNewPojectMenu}
            className={classes.menu}
          >
            <TextField
              onChange={handleProjectName}
              fullWidth
              label="Nombre"
              value={projectName}
            />
          </BackdropMenu>
        </div>
      </Container>
    </div>
  );
}
