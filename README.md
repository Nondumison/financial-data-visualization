# Financial Data Dashboard 

A web-based dashboard for visualizing and managing financial data in South African Rands (ZAR). This application allows users to upload Excel files containing monthly financial records, display the data in a table, and visualize it using a bar chart. Users can select from a predefined list of users via a dropdown menu.

## Features
- **User Selection**: Choose from multiple users (e.g., Jane Doe, John Smith, Nondu Grace) using a dropdown.
- **Data Upload**: Upload Excel files (.xlsx, .xls) with `Month` and `Amount` columns.
- **Data Visualization**: Display financial data in a responsive bar chart with monthly amounts in ZAR.
- **Summary Statistics**: Show total annual amount, average monthly amount, and the highest month’s amount.
- **Responsive Design**: Works on both desktop and mobile devices with a clean, professional aesthetic.
- **Real-Time Updates**: Refresh data dynamically after uploads or manual refresh.

## Screenshots
### 1. List / Issues Once Logged

![Dashboard / Issues Screen](./client/public/list.jpeg)

## Installation
1. **Clone the Repository**
  
```bash
git clone https://github.com/Nondumison/financial-data-visualization.git
cd financial-data-dashboard
```
2. **Install dependencies:**
`npm install`

3. **Set Up MySQL Database:**

Create a database (e.g., financial_db)
```bash
CREATE DATABASE financial_db;
USE financial_db;
```
Create the required tables:
```bash
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE financial_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    year INT,
    month INT,
    amount DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```
Insert initial users:
```bash
INSERT INTO users (user_id, name) VALUES
(1, 'Jane Doe'),
(2, 'John Smith'),
(3, 'Nondu Grace');
```

4. **Configure Environment:**
Create a `.env `file in the root directory of the project to store your MySQL credentials securely. 
*Example .env file content:*
```bash
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_DATABASE=financial_db
```
5. **Run the Application:**
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Select a User:** Use the dropdown to choose a user (e.g., Jane Doe (1)).
2. **Enter a Year:** Input a year (e.g., 2025).
3. **Upload Data:** Select an Excel file with Month and Amount columns and click "Upload File".
4. **View Data:** The table and chart will update with the uploaded data. Use the "Refresh Data" button to reload if needed.

## Dependencies

**Frontend**: 
- **chart.js** # Charting library (via CDN)

**Backend**: 
- **express** # Web framework
- **express-fileupload** # For handling file uploads
- **mysql2** # MySQL database driver
- **xlsx** # Excel file parsing

## Prerequisites

- Node.js (v16+)
- npm (v8+)
- MySQL (v8.0.42)

## Contributing

- Fork the repo.
- Create a feature branch `git checkout -b feature/your-feature`.
- Commit changes `git commit -m "Add your feature"`.
- Push to the branch `git push origin feature/your-feature`.
- Open a pull request.

## License
MIT License

**Inspired by financial data tracking needs.**
Uses Chart.js for visualization and Font Awesome for icons.

## Contact
For questions or support, please open an issue on the repository or contact the maintainer.

## Acknowledgments
Built with ❤️ by Nondumiso Nkosi