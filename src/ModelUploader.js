import React from "react";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";

export default function ModelUploader() {
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [name, setName] = React.useState("");

  const sendFile = (event) => {
    if (file) {
      setLoading(true);
      fetch("https://bimapi.velociti.cl/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: "bim_test",
          password: "test",
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          let formData = new FormData();
          formData.append("bim", file, name);
          return fetch("https://bimapi.velociti.cl/dev_new_model", {
            method: "POST",
            headers: {
              Authorization: res.token,
              'Content-Type': 'multipart/form-data',
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
    setName(event.target.value);
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
          <Grid container spacing={3} justify="center">
            <Grid item xs={12}>
              <input type="file" onChange={selectFile} />
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
