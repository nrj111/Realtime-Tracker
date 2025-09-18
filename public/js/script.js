const socket = io();

// UI elements
const nameInput = document.getElementById("nameInput");
const saveNameBtn = document.getElementById("saveNameBtn");
const shareToggle = document.getElementById("shareToggle");
const followToggle = document.getElementById("followToggle");
const userListEl = document.getElementById("userList");

// Persisted name
nameInput.value = localStorage.getItem("rt_name") || "";

// Track self
let selfId = null;
socket.on("connect", () => {
	selfId = socket.id;
	socket.emit("set-username", nameInput.value || "Guest");
});

saveNameBtn.addEventListener("click", () => {
	const name = nameInput.value.trim().slice(0, 32);
	localStorage.setItem("rt_name", name);
	socket.emit("set-username", name || "Guest");
});

// Map setup
const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "NRJ Creations" }).addTo(map);

// State
const markers = {};
const accuracyCircles = {};
let selfTrail = L.polyline([], { color: "#1976d2", weight: 3 }).addTo(map);

// Start/Stop sharing
let watchId = null;
function startWatching() {
	if (!navigator.geolocation || watchId !== null) return;
	watchId = navigator.geolocation.watchPosition(
		(pos) => {
			const c = pos.coords;
			socket.emit("send-location", {
				latitude: c.latitude,
				longitude: c.longitude,
				accuracy: c.accuracy,
				speed: Number.isFinite(c.speed) ? c.speed : undefined,
				heading: Number.isFinite(c.heading) ? c.heading : undefined,
				timestamp: pos.timestamp
			}, (resp) => {
				if (resp && resp.ok === false) {
					console.warn("Server rejected location:", resp.error);
				}
			});
		},
		(err) => console.warn("Geolocation error:", err.message),
		{
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 1000
		}
	);
}
function stopWatching() {
	if (watchId !== null) {
		navigator.geolocation.clearWatch(watchId);
		watchId = null;
	}
}
shareToggle.addEventListener("change", () => {
	if (shareToggle.checked) startWatching(); else stopWatching();
});
// start by default if allowed
if (shareToggle?.checked) startWatching();

// Helpers
function updateUserList(usersMap) {
	// usersMap: { id: { username, lat, lon, ts } }
	const items = Object.entries(usersMap).map(([id, u]) => {
		const name = u.username || `User ${id.slice(0, 6)}`;
		const when = u.ts ? new Date(u.ts).toLocaleTimeString() : "";
		return `<li title="${id}"><strong>${name}</strong><br/><small>${u.lat?.toFixed(5) || "?"}, ${u.lon?.toFixed(5) || "?"} • ${when}</small></li>`;
	});
	userListEl.innerHTML = `<ul>${items.join("")}</ul>`;
}
const users = {}; // id -> { username, lat, lon, ts }

// Receive locations
socket.on("receive-location", (data) => {
	const { id, username, latitude, longitude, accuracy, timestamp } = data;
	const isSelf = id === selfId;

	// user list bookkeeping
	users[id] = { username, lat: latitude, lon: longitude, ts: timestamp };
	updateUserList(users);

	// marker
	if (markers[id]) {
		markers[id].setLatLng([latitude, longitude]);
	} else {
		const label = isSelf ? (username ? `You (${username})` : "You") : (username || `User ${id.slice(0, 6)}`);
		markers[id] = L.marker([latitude, longitude]).addTo(map).bindPopup(label);
		if (isSelf) markers[id].openPopup();
	}

	// accuracy circle
	if (Number.isFinite(accuracy)) {
		if (accuracyCircles[id]) {
			accuracyCircles[id].setLatLng([latitude, longitude]).setRadius(accuracy);
		} else {
			accuracyCircles[id] = L.circle([latitude, longitude], {
				radius: accuracy,
				color: isSelf ? "#1976d2" : "#555",
				fillColor: isSelf ? "#64b5f6" : "#999",
				fillOpacity: 0.2,
				weight: 1
			}).addTo(map);
		}
	}

	// follow self: recenter only for your own updates and when enabled
	if (isSelf && followToggle?.checked) {
		map.setView([latitude, longitude]);
		// trail
		const pts = selfTrail.getLatLngs();
		pts.push([latitude, longitude]);
		// keep last 500 points
		if (pts.length > 500) pts.splice(0, pts.length - 500);
		selfTrail.setLatLngs(pts);
	}
});

socket.on("user-info", ({ id, username }) => {
	// Update name immediately in the list/popups
	if (!users[id]) users[id] = {};
	users[id].username = username;
	updateUserList(users);
	if (markers[id]) markers[id].setPopupContent(id === selfId ? `You (${username})` : username);
});

socket.on("user-disconnected", (id) => {
	if (markers[id]) {
		map.removeLayer(markers[id]);
		delete markers[id];
	}
	if (accuracyCircles[id]) {
		map.removeLayer(accuracyCircles[id]);
		delete accuracyCircles[id];
	}
	if (users[id]) {
		delete users[id];
		updateUserList(users);
	}
});