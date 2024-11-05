import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let users = [];

io.on("connection", (socket) => {
  console.log("socket connected with id of", socket.id);

  socket.emit("message", users);

  socket.on("userEvent", (user) => {
    console.log("user event is ", user);

    const newUser = {
      id: socket.id,
      name: user.name,
      age: user.age,
    };

    users.push(newUser);

    io.emit("message", users);
    console.log("new user event emitted");
  });

  socket.on("leave", (username) => {
    console.log("leave event received as ", username);

    users = users.filter((user) => user.name !== username);

    io.emit("message", users);

    console.log(username + " left the meeting.");
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.id !== socket.id);
    io.emit("message", users);
  });
});

io.listen(5000, () => {
  console.log("socket server is running");
});
