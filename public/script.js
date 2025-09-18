document.addEventListener("DOMContentLoaded", function () {
  const uploadForm = document.getElementById("uploadForm");
  const alertBox = document.getElementById("alertBox");
  const loader = document.getElementById("loader");
  const dataSection = document.getElementById("dataSection");
  const dataTable = document.getElementById("dataTable");
  const userNameEl = document.getElementById("userName");
  const dataYearEl = document.getElementById("dataYear");
  const totalAmountEl = document.getElementById("totalAmount");
  const averageAmountEl = document.getElementById("averageAmount");
  const highestMonthEl = document.getElementById("highestMonth");
  const highestAmountEl = document.getElementById("highestAmount");
  const refreshBtn = document.getElementById("refreshBtn");
  let financialChart = null;

  // Updated user data to match database and request
  const users = {
    1: "Jane Doe",
    2: "John Smith",
    3: "Nondu Grace",
  };

  // Format currency in ZAR
  function formatZAR(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return "R 0.00";
    return "R " + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  }

  // Get month name from number
  function getMonthName(monthNumber) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1] || monthNumber;
  }

  // Handle form submission
  uploadForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const userId = document.getElementById("userId").value;
    const year = document.getElementById("year").value;
    const fileInput = document.getElementById("file");

    if (!fileInput.files.length) {
      showAlert("Please select a file to upload", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    showLoader(true);
    hideAlert();

    try {
      const response = await fetch(`/api/finances/upload/${userId}/${year}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(
          result.message ||
            "File uploaded successfully! Data processed and stored.",
          "success"
        );
        fileInput.value = "";
        await loadData(userId, year);
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("Error uploading file: " + error.message, "error");
    } finally {
      showLoader(false);
    }
  });

  // Refresh button handler
  refreshBtn.addEventListener("click", function () {
    const userId = document.getElementById("userId").value;
    const year = document.getElementById("year").value;
    loadData(userId, year);
  });

  // Function to load data from API
  async function loadData(userId, year) {
    showLoader(true);

    try {
      const response = await fetch(`/api/finances/${userId}/${year}`);

      if (!response.ok) {
        throw new Error("Failed to fetch data: " + response.statusText);
      }

      const data = await response.json();

      userNameEl.textContent = users[userId] || `User ${userId}`;
      dataYearEl.textContent = year;
      calculateSummary(data);
      displayDataTable(data);
      displayChart(data);
      dataSection.classList.remove("hidden");
    } catch (error) {
      console.error("Error loading data:", error);
      showAlert("Error loading data: " + error.message, "error");
      loadSampleData(userId, year);
    } finally {
      showLoader(false);
    }
  }

  // Function to calculate summary values
  function calculateSummary(data) {
    let total = 0;
    let highest = { amount: 0, month: "" };

    data.forEach((row) => {
      const amount = parseFloat(row.amount) || 0;
      total += amount;
      if (amount > highest.amount) {
        highest.amount = amount;
        highest.month = getMonthName(row.month);
      }
    });

    const average = data.length > 0 ? total / data.length : 0;

    totalAmountEl.textContent = formatZAR(total);
    averageAmountEl.textContent = formatZAR(average);
    highestMonthEl.textContent = highest.month;
    highestAmountEl.textContent = formatZAR(highest.amount);
  }

  // Function to load sample data (for demo purposes)
  function loadSampleData(userId, year) {
    const sampleData = [
      { month: 1, amount: 100.5 },
      { month: 2, amount: 200.75 },
      { month: 3, amount: 150.25 },
      { month: 4, amount: 300.8 },
      { month: 5, amount: 1000.05 },
      { month: 6, amount: 1800.99 },
      { month: 7, amount: 2500.78 },
      { month: 8, amount: 5555.99 },
      { month: 9, amount: 18000.96 },
      { month: 10, amount: 25000.66 },
      { month: 11, amount: 9000.5 },
      { month: 12, amount: 33300.45 },
    ];

    userNameEl.textContent = users[userId] || `User ${userId}`;
    dataYearEl.textContent = year;
    calculateSummary(sampleData);
    displayDataTable(sampleData);
    displayChart(sampleData);
    dataSection.classList.remove("hidden");
  }

  // Function to display data in table
  function displayDataTable(data) {
    dataTable.innerHTML = "";
    const sortedData = [...data].sort((a, b) => a.month - b.month);

    sortedData.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${getMonthName(row.month)}</td>
                <td class="amount-cell">${formatZAR(row.amount)}</td>
            `;
      dataTable.appendChild(tr);
    });
  }

  // Function to display chart
  function displayChart(data) {
    const ctx = document.getElementById("financialChart").getContext("2d");

    if (financialChart) {
      financialChart.destroy();
    }

    const sortedData = [...data].sort((a, b) => a.month - b.month);

    financialChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: sortedData.map((row) => getMonthName(row.month)),
        datasets: [
          {
            label: "Amount (ZAR)",
            data: sortedData.map((row) => parseFloat(row.amount) || 0),
            backgroundColor: "rgba(44, 90, 160, 0.7)",
            borderColor: "rgba(44, 90, 160, 1)",
            borderWidth: 1,
            borderRadius: 5,
            hoverBackgroundColor: "rgba(30, 60, 114, 0.8)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Amount (ZAR)" },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
            ticks: { callback: (value) => "R " + value.toLocaleString() },
          },
          x: {
            title: { display: true, text: "Months" },
            grid: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Amount: ${formatZAR(context.raw)}`,
            },
          },
        },
      },
    });
  }

  // Helper function to show alert
  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.classList.remove("hidden");
    if (type === "success") {
      setTimeout(hideAlert, 5000);
    }
  }

  // Helper function to hide alert
  function hideAlert() {
    alertBox.classList.add("hidden");
  }

  // Helper function to show/hide loader
  function showLoader(show) {
    if (show) {
      loader.classList.remove("hidden");
      document.getElementById("uploadBtn").disabled = true;
      refreshBtn.style.opacity = "0.7";
      refreshBtn.style.pointerEvents = "none";
    } else {
      loader.classList.add("hidden");
      document.getElementById("uploadBtn").disabled = false;
      refreshBtn.style.opacity = "1";
      refreshBtn.style.pointerEvents = "auto";
    }
  }

  // Load data on page load for demo purposes
  setTimeout(() => {
    loadData(1, 2025);
  }, 500);
});
