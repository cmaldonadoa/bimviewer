import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import FormControl from "@material-ui/core/FormControl";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 220,
  },
  icon: {
    minWidth: "40px",
  },
}));

const StyledListItemButton = (props) => {
  const classes = useStyles();
  const label = props.label;
  const onClick = props.onClick;
  const icon = props.icon;
  const className = props.className;

  return (
    <ListItem button className={className} onClick={onClick}>
      {icon ? (
        <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      ) : null}
      <ListItemText primary={label} />
    </ListItem>
  );
};

const StyledListItemToggleButton = (props) => {
  const label = props.label;
  const onChange = props.onChange;
  const value = props.value;
  const options = props.options;

  return (
    <ListItem>
      <ListItemText primary={label} />
      <ListItemIcon>
        <ToggleButtonGroup
          size="small"
          value={value}
          exclusive
          onChange={onChange}
        >
          {options.map((option) => (
            <ToggleButton
              key={option.value}
              value={option.value}
            >
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </ListItemIcon>
    </ListItem>
  );
};

const StyledListItemSwitch = (props) => {
  const label = props.label;
  const onChange = props.onChange;
  const checked = props.checked;

  return (
    <ListItem>
      <ListItemText primary={label} />
      <Switch checked={checked} onChange={onChange} color="primary" />
    </ListItem>
  );
};

const StyledListItemSelect = (props) => {
  const classes = useStyles();
  const label = props.label;
  const onChange = props.onChange;
  const value = props.value;
  const options = props.options;

  return (
    <ListItem>
      <ListItemText primary={label} />
      <FormControl className={classes.formControl}>
        <Select value={value} displayEmpty onChange={onChange}>
          <MenuItem value="">
            <em>Ninguno</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Typography variant="inherit">{option.label}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </ListItem>
  );
};

const StyledListItemAccordion = (props) => {
  const label = props.label;
  const onClick = props.onClick;
  const open = props.open;

  return (
    <React.Fragment>
      <ListItem button onClick={onClick}>
        <ListItemText primary={label} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {props.children}
        </List>
      </Collapse>
    </React.Fragment>
  );
};

export {
  StyledListItemButton,
  StyledListItemToggleButton,
  StyledListItemSwitch,
  StyledListItemSelect,
  StyledListItemAccordion,
};
