const express = require("express");
const router = express.Router();
const db = require("../config/db");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

router.post("/finances/upload/:userId/:year", async (req, res) => {
  const { userId, year } = req.params;

  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const file = req.files.file;
  const uploadPath = path.join(uploadDir, file.name);

  try {
    // Move the uploaded file
    await file.mv(uploadPath);

    // Read and parse the Excel file
    const workbook = XLSX.readFile(uploadPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Start a transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Delete existing records for this user and year
      await connection.execute(
        "DELETE FROM financial_records WHERE user_id = ? AND year = ?",
        [userId, year]
      );

      // Insert new records
      for (const row of worksheet) {
        // Handle different month formats (number or name)
        let month = row.Month;
        if (isNaN(month)) {
          // Convert month name to number if needed
          const monthNames = [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
          ];
          month = monthNames.indexOf(month.toLowerCase()) + 1;
          if (month === 0) {
            throw new Error(`Invalid month name: ${row.Month}`);
          }
        }

        await connection.execute(
          "INSERT INTO financial_records (user_id, year, month, amount) VALUES (?, ?, ?, ?)",
          [userId, year, month, row.Amount]
        );
      }

      // Commit the transaction
      await connection.commit();
      connection.release();

      // Delete the uploaded file
      fs.unlinkSync(uploadPath);

      res.json({ message: "File uploaded and data stored successfully" });
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Error processing file: " + error.message });
  }
});

router.get("/finances/:userId/:year", async (req, res) => {
  const { userId, year } = req.params;

  try {
    const [results] = await db.execute(
      "SELECT * FROM financial_records WHERE user_id = ? AND year = ? ORDER BY month",
      [userId, year]
    );
    res.json(results);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ error: "Error retrieving data" });
  }
});

module.exports = router;
