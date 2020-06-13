import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Skeleton from "@material-ui/lab/Skeleton";
import PropertiesContainer from "./PropertiesContainer";
import ModelOptions from "./ModelOptions";

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
    padding: 0,
  },
}));

export default function Sidebar(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [entity, setEntity] = React.useState(null);
  const [storeys, setStoreys] = React.useState([]);
  const mountTree = (flag) =>
    flag ? props.tree.mount() : props.tree.unmount();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    mountTree(!value);
    if (value === 1) {
      let newStoreys = [];
      for (let storeyId of props.tools.getStoreys()) {
        let data = props.metadata[storeyId];
        let name = data.attributes.Name || "IfcBuildingStorey";
        newStoreys.push({
          id: storeyId,
          name: name,
        });
      }
      setStoreys(newStoreys);
    }
  }, [value]);

  React.useEffect(() => {
    setEntity(props.tree.currentEntity);
  }, [props.tree.currentEntity]);

  return (
    <div className={classes.root} onClick={() => props.onClick()}>
      <AppBar position="static">
        <Tabs variant="fullWidth" value={value} onChange={handleChange}>
          <Tab label="Navegación" {...a11yProps(0)} />
          <Tab label="Herramientas" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <div id="tree-container">
          <div
            style={{
              display: props.loading ? "block" : "none",
              paddingLeft: "10px",
              paddingRight: "15px",
            }}
          >
            <Skeleton className="skeleton-tree" style={{ opacity: "1" }} />
            <Skeleton className="skeleton-tree" style={{ opacity: "0.75" }} />
            <Skeleton className="skeleton-tree" style={{ opacity: "0.5" }} />
            <Skeleton className="skeleton-tree" style={{ opacity: "0.25" }} />
          </div>
        </div>
        <PropertiesContainer entity={entity} metadata={props.metadata} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <div style={{ height: "calc(100vh - 48px)" }}>
          <ModelOptions
            storeys={storeys}
            setStorey={props.tools.setStorey}
            setProjection={props.tools.setProjection}
            toggleMinimap={props.tools.toggleMinimap}
            toggleFirstPerson={props.tools.setFirstPerson}
          />
        </div>
      </TabPanel>
    </div>
  );
}
