import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Skeleton from '@material-ui/lab/Skeleton';
import PropertiesContainer from "./PropertiesContainer";


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`sidebar-tabpanel-${index}`}
      className="sidebar-tabpanel"
      aria-labelledby={`sidebar-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `sidebar-tab-${index}`,
    "aria-controls": `sidebar-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    padding: 0
  },
}));

function SkeletonTree(props) {
  return <Skeleton className="skeleton-tree" style={{opacity: props.opacity}} />
}

export default function Sidebar(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [entity, setEntity] = React.useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    if (value === 0) {
      props.mountTree();
    } else {
      props.unmountTree();
    }
  }, [value]);

  React.useEffect(() => {
    setEntity(props.currentEntity);
  }, [props.currentEntity]);

  return (
    <div className={classes.root} onClick={() => props.onClick()}>
      <AppBar position="static">
        <Tabs variant="fullWidth" value={value} onChange={handleChange}>
          <Tab label="Navegación" {...a11yProps(0)} />
          <Tab label="Opciones" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <div id="tree-container">
          <div style={{
            display: props.loading ? "block" : "none",
            paddingLeft: "10px",
            paddingRight: "15px"
          }}>
            <Skeleton className="skeleton-tree" style={{opacity: 1}} />
            <Skeleton className="skeleton-tree" style={{opacity: 0.75}} />
            <Skeleton className="skeleton-tree" style={{opacity: 0.5}} />
            <Skeleton className="skeleton-tree" style={{opacity: 0.25}} />
          </div>
        </div>
        <PropertiesContainer entity={entity} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <div style={{height: "calc(100vh - 48px)"}}>
        <ul>
          <li>Navegación</li>
            <ul>
              <li>Girar</li>
              <li>Zoom</li>
              <li>Pan</li>
            </ul>
          <li>Acciones</li>
            <ul>
              <li>Ocultar/mostrar</li>
              <li>Aislar</li>
              <li>Mirar</li>
              <li>Planos de recorte</li>
              <li>Medir</li>
            </ul>
          <li>Anotaciones</li>
          <li>Descargas</li>
            <ul>
              <li>PDF</li>
              <li>XLSX</li>
              <li>Pan</li>
            </ul>
        </ul>
        </div>
      </TabPanel>
    </div>
  );
}
