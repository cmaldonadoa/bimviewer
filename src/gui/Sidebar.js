import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Skeleton from "@material-ui/lab/Skeleton";
import PropertiesContainer from "./PropertiesContainer";
import SidebarOptions from "./SidebarOptions";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import Divider from "@material-ui/core/Divider";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`sidebar-tabpanel-${index}`}
      className="sidebar-tabpanel"
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

const responsive = false;
const drawerWidth = responsive ? "100vw" : 430;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    padding: 0,
    overflow: "hidden",
  },
  appbar: {
    boxShadow: "none",
  },
  placeholder: {
    paddingLeft: "10px",
    paddingRight: "15px",
  },
  menuButton: {
    background: "white",
    margin: "5px",
    "& svg": {
      width: "24px",
      height: "24px",
    },
    "&:hover": {
      background: "#eee",
    },
  },
  closeButton: {
    zIndex: 1,
    margin: "5px",
    "& svg": {
      width: "24px",
      height: "24px",
      color: "white",
    },
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    border: "none",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    width: "100%",
    justifyContent: "flex-end",
  },
  secondDrawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
}));

export default function Sidebar(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [entity, setEntity] = React.useState(null);
  const [storeys, setStoreys] = React.useState([]);
  const [open, setOpen] = React.useState(!responsive);
  const [secondDrawerContent, setSecondDrawerContent] = React.useState(null);
  const [secondDrawerOpen, setSecondDrawerOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

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
    <React.Fragment>
      {responsive ? (
        <IconButton
          color="inherit"
          onClick={handleDrawerOpen}
          className={clsx(classes.menuButton, open && classes.hide)}
        >
          <MenuIcon />
        </IconButton>
      ) : null}

      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.root} onClick={() => props.onClick()}>
          <AppBar position="static" className={classes.appbar}>
            <Tabs
              variant={responsive ? "" : "fullWidth"}
              value={value}
              onChange={handleChange}
            >
              <Tab label="Navegación" />
              <Tab label="Herramientas" />
              {responsive ? (
                <div className={classes.drawerHeader}>
                  <IconButton
                    className={classes.closeButton}
                    onClick={handleDrawerClose}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                </div>
              ) : null}
            </Tabs>
          </AppBar>
          <TabPanel value={value} index={0}>
            <div id="tree-container">
              <div
                className={classes.placeholder}
                style={{
                  display: props.loading ? "block" : "none",
                }}
              >
                <Skeleton className="skeleton-tree" />
                <Skeleton className="skeleton-tree" />
                <Skeleton className="skeleton-tree" />
                <Skeleton className="skeleton-tree" />
              </div>
            </div>
            <PropertiesContainer entity={entity} metadata={props.metadata} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <div style={{ height: "calc(100vh - 48px)", overflowY: "auto" }}>
              <SidebarOptions
                storeys={storeys}
                setStorey={props.tools.setStorey}
                setProjection={props.tools.setProjection}
                setCameraMode={props.tools.setCameraMode}
                toggleFirstPerson={props.tools.setFirstPerson}
                createSectionPlane={props.tools.createSectionPlane}
                fitModel={props.tools.fitModel}
                measureDistance={props.tools.measureDistance}
                createAnnotations={props.tools.createAnnotations}
                destroyAnnotation={props.tools.destroyAnnotation}
                saveAnnotation={props.tools.saveAnnotation}
                toggleAnnotation={props.tools.toggleAnnotation}
                takeSnapshot={props.tools.takeSnapshot}
                downloadExcel={props.tools.downloadExcel}
                secondDrawer={{
                  setContent: setSecondDrawerContent,
                  setOpen: setSecondDrawerOpen,
                }}
                annotations={props.annotations}
              />
            </div>
          </TabPanel>
        </div>
      </Drawer>
      <Drawer
        classes={{
          paper: classes.drawerPaper,
        }}
        variant="persistent"
        open={secondDrawerOpen}
        anchor="left"
      >
        <div className={classes.secondDrawerHeader}>
          <IconButton onClick={() => setSecondDrawerOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        {secondDrawerContent}
      </Drawer>
    </React.Fragment>
  );
}
