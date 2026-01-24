import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  path: "/api/socket/io",
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected to socket");
  
  const showtimeId = "test-movie:2026-01-01:12:00";
  socket.emit("join-showtime", showtimeId);

  // Spam 15 selection requests
  let count = 0;
  const interval = setInterval(() => {
    count++;
    console.log(`Sending selection request ${count}`);
    socket.emit("select-seat", {
        showtimeId,
        seatLabel: `A${count}`,
        userId: "test-user"
    });

    if (count >= 15) {
        clearInterval(interval);
        setTimeout(() => {
            socket.disconnect();
            process.exit(0);
        }, 2000);
    }
  }, 100);
});

socket.on("seat-locked", (data) => {
    console.log("SUCCESS: Seat locked:", data.seatLabel);
});

socket.on("seat-error", (data) => {
    console.log("ERROR RECEIVED:", data.message);
});

socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
    process.exit(1);
});
