import React from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import CircularProgress from "@material-ui/core/CircularProgress";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import CheckCircleOutlineOutlinedIcon from "@material-ui/icons/CheckCircleOutlineOutlined";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort, headCells } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

function EnhancedTable(props) {
  const classes = useStyles();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const { headCells, rows } = props;

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={"small"}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              headCells={headCells}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy)).map(
                (row, index) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {Object.keys(row).map((attr, idx) =>
                        attr === "id" ? null : (
                          <TableCell key={row.id + "-" + idx} align="left">
                            {row[attr]}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
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
  },
}))(MuiAccordionDetails);

const ProjectBar = (props) => {
  const [deleted, setDeleted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [models, setModels] = React.useState([]);
  const [expanded, setExpanded] = React.useState(false);
  const [pending, setPending] = React.useState(0);
  const name = props.name;
  const id = props.id;
  const onAdd = props.onAdd;
  const onOpen = props.onOpen;

  React.useEffect(() => {
    if (expanded && pending > 0) {
      setTimeout(() => {
        fetch(`https://bimapi.velociti.cl/dev_get_projects/${id}/info`, {
          headers: {
            Authorization: "public_auth",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            let info = data.info;
            setModels(info);
            setPending(info.filter((row) => row.loading).length);
          })
          .catch((err) => console.error(err));
      }, 5000);
    }
  });

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) {
      setLoading(true);
      fetch(`https://bimapi.velociti.cl/dev_get_projects/${id}/info`, {
        headers: {
          Authorization: "public_auth",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          let info = data.info;
          setModels(info);
          setPending(info.filter((row) => row.loading).length);
        })
        .catch((err) => console.error(err));
    }
  };

  if (deleted) {
    return null;
  }
  return (
    <Accordion onChange={handleExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <h5>{name}</h5>
          </div>
          <div
            className="d-flex justify-content-around"
            style={{ width: "120px" }}
          >
            <IconButton onClick={onAdd}>
              <AddCircleIcon />
            </IconButton>
            <IconButton onClick={onOpen}>
              <OpenInNewIcon />
            </IconButton>
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        {loading ? (
          <div className="w-100 d-flex justify-content-center">
            <CircularProgress color="inherit" size={16} />
          </div>
        ) : models.length === 0 ? (
          <Typography>No se han cargado modelos a este proyecto.</Typography>
        ) : (
          <EnhancedTable
            rows={models.map((model) => {
              return {
                id: model.id,
                tag: model.tag,
                name: model.name,
                filename: model.original_name,
                loading: model.loading ? (
                  <div
                    className="d-flex align-items-center"
                    style={{ color: "#f50057" }}
                  >
                    <CircularProgress
                      style={{ margin: 2 }}
                      color="secondary"
                      size={16}
                    />
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
            })}
            headCells={[
              {
                id: "tag",
                numeric: false,
                disablePadding: false,
                label: "Tipo",
              },
              {
                id: "name",
                numeric: false,
                disablePadding: false,
                label: "Nombre",
              },
              {
                id: "filename",
                numeric: false,
                disablePadding: false,
                label: "Archivo",
              },
              {
                id: "status",
                numeric: false,
                disablePadding: false,
                label: "Estado",
              },
            ]}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default ProjectBar;
