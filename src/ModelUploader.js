import React from "react";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import TextField from "@material-ui/core/TextField";

export default function ModelUploader() {
  const [loading, setLoading] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [file, setFile] = React.useState(null);

  const onChangeUsername = (event) => {
    setUsername(event.target.value);
  };

  const onChangePassword = (event) => {
    setPassword(event.target.value);
  };

  const sendFile = (event) => {
    if (file && username && password) {
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
          let formData = new FormData();
          formData.append("bim", file);
          return fetch("https://bimapi.velociti.cl/dev_new_model", {
            method: "POST",
            headers: {
              Authorization: res.token
            },
            body: formData,
          });
        })
        .then((res) => res.json())
        .then((res) => {
          window.location.href = res.url;
        })
        .catch((err) => console.error(err));
    }
  };

  const selectFile = (event) => {
    setFile(event.target.files[0]);
  };

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
              <TextField label="Contraseña" type="password" onChange={onChangePassword} />
            </Grid>
            <Grid item xs={12}>
              <input type="file" onChange={selectFile} accept=".ifc, .ifczip" />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={sendFile}>
                Enviar
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
