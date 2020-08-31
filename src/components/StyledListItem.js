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
import Slider from "@material-ui/core/Slider";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  noPaddingY: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  toggleButtonGroup: {
    minWidth: 220,
    maxWidth: 220,
  },
  toggleButton: {
    width: ({ btnWidth }) => `${btnWidth}%`,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 220,
    maxWidth: 220,
    marginBottom: 6,
    marginTop: 6,
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
  const exclusive = props.exclusive;
  let n = options.length;
  let btnWidth = 100 / n;
  const classes = useStyles({ btnWidth });

  return (
    <ListItem>
      <ListItemText primary={label} />
      <ListItemIcon>
        <ToggleButtonGroup
          size="small"
          value={value}
          exclusive={exclusive}
          onChange={onChange}
          className={classes.toggleButtonGroup}
        >
          {options.map((option) => (
            <ToggleButton
              className={classes.toggleButton}
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
  const className = props.className;

  return (
    <ListItem className={`${classes.noPaddingY} ${className}`}>
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
  const className = props.className;

  return (
    <React.Fragment>
      <ListItem button className={className} onClick={onClick}>
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

const StyledListItemSlider = (props) => {
  const classes = useStyles();
  const label = props.label;
  const onChange = props.onChange;
  const value = props.value;
  const className = props.className;
  const min = props.min;
  const max = props.max;
  const step = props.step;

  return (
    <ListItem className={`${classes.noPaddingY} ${className}`}>
      <ListItemText primary={label} />
      <FormControl className={classes.formControl}>
        <Slider
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
        />
      </FormControl>
    </ListItem>
  );
};

export {
  StyledListItemButton,
  StyledListItemToggleButton,
  StyledListItemSwitch,
  StyledListItemSelect,
  StyledListItemAccordion,
  StyledListItemSlider,
};
