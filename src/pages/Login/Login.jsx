import React from "react";
import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import jwt_decode from "jwt-decode";
import "./Login.scss";
import instance from "../../API/api";
import { SHA256 } from "crypto-js";
import { useParams } from "../../hooks/useParams";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../hooks/useApp";

// gcloud 註冊的 ＮoteFlow Project 帳號
const client_id =
  "951808884400-u2gdsuok7ae5imn9d1e9v24cm666ohs1.apps.googleusercontent.com";

const Profile = ({ user }) => {
  return (
    <div className="profile">
      <img src={user.picture} alt="" />
      <h3>{user.name}</h3>
    </div>
  );
};

const Login = () => {
  useEffect(() => {
    instance
      .get("/user/who-am-i")
      .then((res) => {
        if (res.status == 200) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          refetchFromLocalStorage();
          navigateTo("/home");
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, []); // user 是 google 回傳的 object, 可以拿去 render profile 頁面
  const divRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigateTo = useNavigate();
  const { refetchFromLocalStorage } = useApp();
  const handleCallbackResponse = (res) => {
    const userObject = jwt_decode(res.credential);
    instance
      .post("/user/google-login", { user: userObject })
      .then((res) => {
        if (res.status == 200) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          refetchFromLocalStorage();
          navigateTo("/home");
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const handleRegister = (e) => {
    navigateTo("/Register");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordHashed = SHA256(password).toString();
    const request = {
      user: {
        email: email,
        password: passwordHashed,
      },
    };

    console.log(email);
    console.log(password);

    // const request = {
    //   user: {
    //     email: "admin@gmail.com",
    //     password: SHA256("112a").toString(),
    //   },
    // };

    instance
      .post("/user/login", request)
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        refetchFromLocalStorage();
        navigateTo("/home");
      })
      .catch((e) => {
        console.log("Login error");
      });
  };

  useEffect(() => {
    /* global google */
    if (divRef.current) {
      google.accounts.id.initialize({
        client_id: client_id,
        callback: handleCallbackResponse,
      });

      google.accounts.id.renderButton(document.getElementById("signInDiv"), {
        theme: "dark",
        width: "330",
      });

      google.accounts.id.prompt();
    }
  }, [divRef.current]);

  return (
    <div className="login">
      <div className="login-container">
        <div className="logo">
          <img src="/src/assets/logo.png" alt="" width="190" height="190" />
          <h1>NoteFlow</h1>
        </div>
        <div className="info">
          <h2>Log in</h2>

          <div className="infoContainer">
            <>
              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                style={{ margin: "10px 15px" }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  size="small"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  size="small"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, mb: 2 }}
                  style={{ backgroundColor: "#0e1111" }}
                >
                  Log in
                </Button>
                <div
                  className="links"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Link href="#" variant="body2" style={{ color: "#414a4c" }}>
                    Forgot password?
                  </Link>
                  <Link href="#" variant="body2" style={{ color: "#414a4c" }}>
                    {"Don't have an account? Sign Up"}
                  </Link>
                </div>
              </Box>
            </>
          </div>
          <div className="horizontalLine">
            <span>OR</span>
          </div>
          <div id="signInDiv" ref={divRef}></div>

          <div
            className="links"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "65%",
            }}
          >
            <Link href="#" variant="body2" style={{ color: "#414a4c" }}>
              Doesn't have an account yet?
            </Link>
            <Button
              type="submit"
              variant="contained"
              style={{ backgroundColor: "#0e1111", width: "50%" }}
              onClick={(e) => {
                handleRegister(e);
              }}
            >
              Register
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Login, Profile };
