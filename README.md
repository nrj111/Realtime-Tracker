# 🌍 Realtime-Tracker  

A **realtime location tracking app** built using **Node.js, Express, Socket.io, and Leaflet.js**.  
It allows users to share and view their live location on a map, with updates happening instantly across all connected clients.  

---

## 🚀 Features  

✅ Realtime location tracking with **WebSockets (Socket.io)**  
✅ Interactive map powered by **Leaflet.js & OpenStreetMap**  
✅ Multiple users can join and see each other’s locations live  
✅ Automatic removal of markers when a user disconnects  
✅ Clean and minimal UI  

---

## 🛠️ Tech Stack  

- **Backend:** Node.js, Express.js, Socket.io  
- **Frontend:** EJS, Leaflet.js, JavaScript, CSS  
- **Map Provider:** OpenStreetMap (via Leaflet.js)  

---

## 📂 Project Structure  


Realtime-Tracker/
│
├── app.js # Main server file
├── package.json
├── /views
│ └── index.ejs # Main frontend page
│
├── /public
│ ├── /css
│ │ └── style.css # Styles for map and UI
│ ├── /js
│ │ └── script.js # Frontend socket & map logic
│
└── README.md # Project documentation


---

## ⚙️ How It Works  

1. When a user opens the app, their browser requests location access.  
2. The **geolocation API** fetches live latitude and longitude.  
3. Using **Socket.io**, this location is sent to the server.  
4. The server broadcasts the updated location to all connected clients.  
5. Leaflet.js updates the marker position on everyone’s map in realtime.  

---

## 📸 Screenshots  

### 🔹 Live Map with Markers  
<img width="1137" height="579" alt="image" src="https://github.com/user-attachments/assets/af856e55-fbe1-40b0-8b56-cec868f44bfc" />
  

### 🔹 Multiple Users Tracking  
<img width="1138" height="581" alt="image" src="https://github.com/user-attachments/assets/3ba92c56-2de5-4340-9c7e-7dbe7966416e" />


---

## 🏃‍♂️ Getting Started  

### 1️⃣ Clone the repository  
```bash
git clone https://github.com/your-username/Realtime-Tracker.git
cd Realtime-Tracker

npm install

node app.js


## 🌟 Future Improvements

📌 Usernames for markers

📌 Chat integration with location sharing

📌 Store movement history (polylines on map)

📌 Mobile-friendly UI


##🖼️ Demo Diagram
+-----------+        +-------------+        +-----------+
|  Browser  | <----> |   Server    | <----> |  Browser  |
| (Client1) |        | (Socket.io) |        | (Client2) |
+-----------+        +-------------+        +-----------+
       ↕                     ↕                     ↕
   Geolocation          Broadcasts           Realtime
   API (coords)         Coordinates          Location


##💡 Author

👨‍💻 Developed by Neeraj Jalodiya
📧 Contact: [jalodiyaneeraj@gmail.com]
🔗 GitHub: [https://github.com/nrj111]
