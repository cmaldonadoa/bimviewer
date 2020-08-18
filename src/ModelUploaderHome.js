import React from "react";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Typography from "@material-ui/core/Typography";
import ModelUploaderProjects from "./ModelUploaderProjects";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export default function ModelUploaderHome() {
  const [loading, setLoading] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onChangeUsername = (event) => {
    setUsername(event.target.value);
  };

  const onChangePassword = (event) => {
    setPassword(event.target.value);
  };

  const signIn = (event) => {
    setLoading(true);
    fetch("https://bimapi.velociti.cl/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: username,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        cookies.set("dev-bim-jwt", res.token, { path: "/" });
        window.location.reload();
      });
  };

  if (cookies.get("dev-bim-jwt")) {
    return <ModelUploaderProjects auth={cookies.get("dev-bim-jwt")} />;
  }
  return (
    <div
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        background: "white",
      }}
    >
      <Container maxWidth="lg">
        <div
          style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            height: "100vh",
            textAlign: "center",
          }}
        >
          <Grid container spacing={5} justify="center">
            <Grid item xs={12}>
              <TextField label="Usuario" onChange={onChangeUsername} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Contraseña"
                type="password"
                onChange={onChangePassword}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={signIn}>
                Entrar
              </Button>
            </Grid>
            {loading ? (
              <Grid item xs={12}>
                <LinearProgress />
              </Grid>
            ) : null}
          </Grid>
        </div>
      </Container>
    </div>
  );
}
