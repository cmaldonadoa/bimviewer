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
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Divider from "@material-ui/core/Divider";
import CloseIcon from "@material-ui/icons/Close";

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
      <Box p={3}>{children}</Box>
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
    justifyContent: "flex-end",
    width: "min-content",
  },
  secondDrawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "space-between",
  },
  drawerTitle: {
    fontSize: "18px !important",
    padding: 12,
  },
  appbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    "& div div .MuiTabs-flexContainer": {
      height: "100%",
    },
  },
}));

export default function Sidebar(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [entity, setEntity] = React.useState(null);
  const [storeys, setStoreys] = React.useState([]);
  const [open, setOpen] = React.useState(true);
  const [secondDrawerContent, setSecondDrawerContent] = React.useState(null);
  const [secondDrawerTitle, setSecondDrawerTitle] = React.useState("");
  const [secondDrawerOpen, setSecondDrawerOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const onMounted = React.useCallback(() => {
    let newStoreysModels = { ARC: {}, STR: {}, MEP: {} };
    for (let type of Object.keys(newStoreysModels)) {
      const storeys = props.tools.getStoreys(type);
      for (let modelId in storeys) {
        let newStoreys = [];
        let thisStoreys = storeys[modelId];
        for (let storeyId of thisStoreys) {
          let data = props.metadata[storeyId];
          if (data) {
            let name = data.attributes.Name || "IfcBuildingStorey";
            newStoreys.push({
              id: storeyId,
              name: name,
            });
          }
        }
        newStoreysModels[type][modelId] = newStoreys;
      }
    }
    setStoreys(newStoreysModels);
  }, [props.metadata, props.tools]);

  React.useEffect(() => {
    if (!props.loading) {
      onMounted();
    }
  }, [onMounted, props.loading]);

  React.useEffect(() => {
    setEntity(props.tree.currentEntity);
  }, [props.tree.currentEntity]);

  return (
    <React.Fragment>
      <IconButton
        color="inherit"
        onClick={handleDrawerOpen}
        className={clsx(classes.menuButton, open && classes.hide)}
      >
        <ChevronRightIcon />
      </IconButton>

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
          <AppBar className={classes.appbar} position="static" elevation={0}>
            <Tabs
              style={{ width: "100%" }}
              variant="fullWidth"
              value={value}
              onChange={handleChange}
            >
              <Tab label="Navegación" />
              <Tab label="Herramientas" />
            </Tabs>
            <div className={classes.drawerHeader}>
              <IconButton
                className={classes.closeButton}
                onClick={handleDrawerClose}
              >
                <ChevronLeftIcon />
              </IconButton>
            </div>
          </AppBar>
          <TabPanel value={value} index={0}>
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
            <div
              id="tree-container"
              style={{
                display: props.loading ? "none" : "block",
              }}
            />
            <PropertiesContainer entity={entity} metadata={props.metadata} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <div style={{ height: "calc(100vh - 48px)", overflowY: "auto" }}>
              <SidebarOptions
                project={props.project}
                storeys={storeys}
                tools={props.tools}
                secondDrawer={{
                  setContent: setSecondDrawerContent,
                  setOpen: setSecondDrawerOpen,
                  setTitle: setSecondDrawerTitle,
                }}
                bcf={props.bcf}
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
          <Typography className={classes.drawerTitle} noWrap>
            {secondDrawerTitle}
          </Typography>
          <IconButton onClick={() => setSecondDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </div>
        <Divider />
        {secondDrawerContent}
      </Drawer>
    </React.Fragment>
  );
}
