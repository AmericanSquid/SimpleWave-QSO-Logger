// Nominatim API URL
const nominatimUrl = "https://nominatim.openstreetmap.org/search";
const qsoForm = document.getElementById("qsoForm");
const qsoLogTable = document.querySelector("#qsoLog tbody");
let qsoLog = JSON.parse(localStorage.getItem("qsoLog")) || [];

// Mode and Other Mode elements
const modeSelect = document.getElementById("mode");
const otherModeContainer = document.getElementById("otherModeContainer");
const otherModeInput = document.getElementById("otherMode");

// User input fields
const userCallSignInput = document.getElementById("userCallSign");
const userLocationInput = document.getElementById("userLocation"); // User's location input field

// Get the date and time input elements
const qsoDateInput = document.getElementById("qsoDate");
const qsoTimeInput = document.getElementById("qsoTime");

// Set the current UTC date in YYYY-MM-DD format
function setCurrentUTCDate() {
  const now = new Date();
  const utcDate = now.toISOString().split("T")[0];
  qsoDateInput.value = utcDate;
}

// Event listeners for UTC date and time
qsoDateInput.addEventListener("focus", () => {
  if (!qsoDateInput.value) {
    setCurrentUTCDate();
  }
});

qsoTimeInput.addEventListener("focus", () => {
  if (!qsoTimeInput.value) {
    setCurrentUTCTime();
  }
});

// Set the current UTC time in 24-hour format
function setCurrentUTCTime() {
  const now = new Date();
  const utcHours = String(now.getUTCHours()).padStart(2, "0");
  const utcMinutes = String(now.getUTCMinutes()).padStart(2, "0");
  qsoTimeInput.value = `${utcHours}:${utcMinutes}`;
}

// Initialize the map
const map = L.map("map").setView([0, 0], 2); // Default map view
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Show or hide the custom mode input based on selection
modeSelect.addEventListener("change", () => {
  if (modeSelect.value === "Other") {
    otherModeContainer.classList.remove("hidden");
    otherModeInput.setAttribute("required", "true");
  } else {
    otherModeContainer.classList.add("hidden");
    otherModeInput.removeAttribute("required");
  }
});

// Validate RST fields (3 digits between 000 and 599)
function isValidRST(rst) {
  return /^[0-5][0-9]{2}$/.test(rst);
}

// Function to geocode a location using the Nominatim API
async function geocodeLocation(locationText) {
  try {
    const response = await fetch(
      `${nominatimUrl}?q=${encodeURIComponent(locationText)}&format=json&addressdetails=1`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { lat, lng: lon }; // Correct lat/lng return
    } else {
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Save user call sign and location to sessionStorage when they change
userCallSignInput.addEventListener("input", () => {
  sessionStorage.setItem("userCallSign", userCallSignInput.value);
});

userLocationInput.addEventListener("input", () => {
  sessionStorage.setItem("userLocation", userLocationInput.value);
});

// Load user call sign and location from sessionStorage on page load
window.addEventListener("DOMContentLoaded", () => {
  const storedCallSign = sessionStorage.getItem("userCallSign");
  const storedLocation = sessionStorage.getItem("userLocation");

  if (storedCallSign) {
    userCallSignInput.value = storedCallSign;
  }

  if (storedLocation) {
    userLocationInput.value = storedLocation;
  }

  qsoLog.forEach(addQSOToTable);
});

// Function to log a QSO and update the UI
async function logQSO(event) {
  event.preventDefault();

  const callSign = document.getElementById("callSign").value;
  const qsoDate = document.getElementById("qsoDate").value;
  const qsoTime = document.getElementById("qsoTime").value;
  const frequency = document.getElementById("frequency").value;
  const qsoLocationText = document.getElementById("location").value; // QSO location
  const userLocationText = userLocationInput.value; // User's location
  const userCallSign = userCallSignInput.value; // User's call sign
  const mode =
    modeSelect.value === "Other" ? otherModeInput.value : modeSelect.value;
  const rstSent = document.getElementById("rstSent").value;
  const rstReceived = document.getElementById("rstReceived").value;
  const remarks = document.getElementById("remarks").value;

  // Validate RST fields
  if (!isValidRST(rstSent) || !isValidRST(rstReceived)) {
    alert("RST values must be exactly 3 digits, between 000 and 599.");
    return;
  }

  // Geocode the QSO location
  const qsoCoordinates = await geocodeLocation(qsoLocationText);

  if (!qsoCoordinates) {
    alert(
      "Geocoding failed. Could not find coordinates for the provided QSO location."
    );
    return;
  }

  // Create a QSO log entry
  const qsoEntry = {
    callSign,
    userCallSign,
    qsoDate,
    qsoTime,
    frequency,
    location: qsoLocationText, // Store QSO location text
    coordinates: qsoCoordinates, // Store QSO coordinates
    mode,
    rstSent,
    rstReceived,
    remarks,
  };

  // Add to the QSO log array
  qsoLog.push(qsoEntry);
  localStorage.setItem("qsoLog", JSON.stringify(qsoLog));

  // Update the table UI
  addQSOToTable(qsoEntry);
  updateMap(); // Update the map with the new QSO
  qsoForm.reset();
  otherModeContainer.classList.add("hidden"); // Hide custom mode input after form reset
}

// Function to add a QSO entry to the table
function addQSOToTable(qsoEntry) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="border px-4 py-2">${qsoEntry.callSign}</td>
    <td class="border px-4 py-2">${qsoEntry.qsoDate}</td>
    <td class="border px-4 py-2">${qsoEntry.qsoTime}</td>
    <td class="border px-4 py-2">${qsoEntry.frequency}</td>
    <td class="border px-4 py-2">${qsoEntry.mode}</td>
    <td class="border px-4 py-2">${qsoEntry.location}</td>
    <td class="border px-4 py-2">${qsoEntry.rstSent}</td>
    <td class="border px-4 py-2">${qsoEntry.rstReceived}</td>
    <td class="border px-4 py-2">${qsoEntry.remarks || "N/A"}</td>
    <td class="border px-4 py-2">Lat: ${qsoEntry.coordinates.lat}, Lng: ${qsoEntry.coordinates.lng}</td>
  `;

  qsoLogTable.appendChild(row);
}

// Function to update the map
async function updateMap() {
  const userLocationText = userLocationInput.value;
  const userCoordinates = await geocodeLocation(userLocationText);

  if (userCoordinates) {
    console.log("User Coordinates:", userCoordinates);

    // Clear the map before adding new layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Set map view to user's location with appropriate zoom
    map.setView([userCoordinates.lat, userCoordinates.lng], 5);

    // Add marker for user's location
    L.marker([userCoordinates.lat, userCoordinates.lng])
      .addTo(map)
      .bindPopup("Your Location")
      .openPopup();
  } else {
    console.error("Failed to get user's coordinates!"); // Error if user geocoding fails
    return; // Stop further execution if user's location can't be found
  }

  // Loop through the QSO log and add markers/lines for each QSO entry
  qsoLog.forEach((entry) => {
    const { lat, lng } = entry.coordinates;

    // Ensure QSO coordinates are valid before adding markers and polylines
    if (lat && lng) {
      // Add marker for the QSO location
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`${entry.callSign} at ${entry.qsoDate}`);

      // Draw a line from the user's location to the QSO location
      L.polyline(
        [
          [userCoordinates.lat, userCoordinates.lng], // Start: user's location
          [lat, lng],                                // End: QSO location
        ],
        { color: "blue" } // Customize line color
      ).addTo(map);
    }
  });
}

// Handle form submission
qsoForm.addEventListener("submit", logQSO);

// Function to export QSO log to ADIF format
function exportToADIF() {
  let adifContent = "ADIF Version 3.0\n<EOH>\n";

  qsoLog.forEach((entry) => {
    const callSign = entry.callSign || "";
    const qsoDate = entry.qsoDate ? entry.qsoDate.replace(/-/g, "") : "";
    const qsoTime = entry.qsoTime || "";
    const frequency = entry.frequency || "";
    const mode = entry.mode || "";
    const rstSent = entry.rstSent || "000";
    const rstReceived = entry.rstReceived || "000";
    const location = entry.location || "";
    const remarks = entry.remarks || "N/A";

    adifContent += `<CALLSIGN:${callSign.length}>${callSign}\n`;
    adifContent += `<QSO_DATE:${qsoDate.length}>${qsoDate}\n`;
    adifContent += `<QSO_TIME:${qsoTime.length}>${qsoTime}\n`;
    adifContent += `<FREQUENCY:${frequency.length}>${frequency}\n`;
    adifContent += `<MODE:${mode.length}>${mode}\n`;
    adifContent += `<RST_SENT:3>${rstSent}\n`;
    adifContent += `<RST_RCVD:3>${rstReceived}\n`;
    adifContent += `<LOCATION:${location.length}>${location}\n`;
    adifContent += `<COMMENTS:${remarks.length}>${remarks}\n\n`;
  });

  adifContent += "<EOR>\n";

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
  const userCallSign = userCallSignInput.value || "unknown";
  const fileName = `${userCallSign}_qso_log_${formattedDate}.adi`;

  const blob = new Blob([adifContent], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}

document.getElementById("exportADIF").addEventListener("click", exportToADIF);

// Function to download the current map as a JPG image
function downloadMapAsJPG() {
  leafletImage(map, function(err, canvas) {
    if (err) {
      console.error("Error generating map image:", err);
      return;
    }

    // Create an image from the canvas
    const img = new Image();
    img.src = canvas.toDataURL("image/jpeg", 0.9);

    img.onload = function() {
      // Create a new canvas with the same dimensions
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const ctx = finalCanvas.getContext("2d");

      // Draw the base map
      ctx.drawImage(canvas, 0, 0);

      // Manually draw the polylines from the Leaflet map
      map.eachLayer(function(layer) {
        if (layer instanceof L.Polyline) {
          ctx.beginPath();
          const latlngs = layer.getLatLngs();

          latlngs.forEach((latlng, i) => {
            const point = map.latLngToContainerPoint(latlng);
            if (i === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });

          ctx.strokeStyle = "blue"; // Set the color
          ctx.lineWidth = 2; // Set the line width
          ctx.stroke();
        }
      });

      // Trigger the download
      const link = document.createElement("a");
      link.href = finalCanvas.toDataURL("image/jpeg", 0.9);
      link.download = `map_qso_${new Date().toISOString().split("T")[0]}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  });
}
// Add event listener to the download button
document.getElementById("downloadMapJPG").addEventListener("click", downloadMapAsJPG);
