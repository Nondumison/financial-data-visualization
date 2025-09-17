require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./config/db");
const apiRoutes = require("./routes/api");
const path = require("path");
const XLSX = require("xlsx");
const fileUpload = require("express-fileupload");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(fileUpload());
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
