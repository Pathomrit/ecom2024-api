//import express
const express = require("express");
const app = express();
const morgan = require("morgan");
const { readdirSync } = require("fs");
const cors = require("cors");

//middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(cors());

//Router
// app.get("/api", (req, res) => {
//   const { email, password } = req.body;
//   console.log(email, password);
//   res.send("Hello get API");
// });

// app.get("/", (req, res) => {
//   res.send("Hello");
// });

readdirSync("./routes").map((item) =>
  app.use("/api", require("./routes/" + item))
);

//start server
app.listen(5000, () => console.log("server is running port 5000"));
