const express = require("express");
const app = express();
const path = require("path");

const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // ensure views path

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
  console.log("Client connected:", socket.id); // log connections

  // Set username for this socket
  socket.on("set-username", (name) => {
    const clean = String(name || "").trim().slice(0, 32) || "Guest";
    socket.data.username = clean;
    // Optionally notify others so the user list can update immediately
    io.emit("user-info", { id: socket.id, username: clean });
  });

  socket.on("send-location", function (data, ack) {
    // validate incoming coordinates
    const { latitude, longitude, accuracy, speed, heading, timestamp } = data || {};
    const valid =
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      isFinite(latitude) &&
      isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;

    if (!valid) {
      if (typeof ack === "function") ack({ ok: false, error: "Invalid coordinates" });
      return;
    }

    const username = socket.data?.username || "Guest";
    io.emit("receive-location", {
      id: socket.id,
      username,
      latitude,
      longitude,
      // optional telemetry if present and finite
      accuracy: Number.isFinite(accuracy) ? accuracy : undefined,
      speed: Number.isFinite(speed) ? speed : undefined,
      heading: Number.isFinite(heading) ? heading : undefined,
      timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
    });
    if (typeof ack === "function") ack({ ok: true });
  });

  socket.on("disconnect", function () {
    console.log("Client disconnected:", socket.id); // log disconnects
    io.emit("user-disconnected", socket.id);
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

app.get("/", function (req, res) {
  res.render("index"); // Looks for views/index.ejs
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
