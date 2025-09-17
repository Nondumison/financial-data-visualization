const express = require("express");
const router = express.Router();
const db = require("../config/db");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

router.post("/finances/upload/:userId/:year", (req, res) => {
  const { userId, year } = req.params;
  if (!req.files || !req.files.file)
    return res.status(400).send("No file uploaded");

  const file = req.files.file;
  const uploadPath = path.join(__dirname, "../uploads/", file.name);

  file.mv(uploadPath, (err) => {
    if (err) return res.status(500).send(err);

    const workbook = XLSX.readFile(uploadPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    worksheet.forEach((row) => {
      db.query(
        "INSERT INTO financial_records (user_id, year, month, amount) VALUES (?, ?, ?, ?)",
        [userId, year, row.Month, row.Amount]
      );
    });

    fs.unlinkSync(uploadPath);
    res.send("File uploaded and data stored successfully");
  });
});

router.get("/finances/:userId/:year", (req, res) => {
  const { userId, year } = req.params;
  db.query(
    "SELECT * FROM financial_records WHERE user_id = ? AND year = ?",
    [userId, year],
    (err, results) => {
      if (err) throw err;
      res.json(results);
    }
  );
});

module.exports = router;
