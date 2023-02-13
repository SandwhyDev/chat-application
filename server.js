var express = require("express");
var http = require("http");
const fs = require("fs");

var app = express();
var server = http.createServer(app);

var io = require("socket.io")(server);
var path = require("path");
const ChatModels = require("./src/models/ChatModels");
const PhotoChat = require("./src/models/PhotoChatModels");

app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index1.html");
});

var name;

io.on("connection", (socket) => {
  // console.log("new user connected");

  socket.on("join room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    io.emit("chat message", `---${name} left the chat---`);
  });

  socket.on("send file", (file) => {
    const fileName = file.name;
    const fileData = Buffer.from(new Uint8Array(file.data));

    fs.writeFile(`./public/images/${fileName}`, fileData, async (err) => {
      if (err) {
        console.log(err);
        return;
      }

      const pushDatabase = await PhotoChat.create({
        data: {
          filename: file.name,
          mimetype: file.mimetype,
          size: file.size,
        },
      });

      if (!pushDatabase) {
        console.log("error");
        return;
      } else {
        console.log("File saved:");

        socket.broadcast.emit("file saved", { name: fileName });
      }
    });
  });

  socket.on("chat message", async (msg) => {
    try {
      const pushDatabase = await ChatModels.create({
        data: {
          user: msg.user,
          message: msg.message,
        },
      });

      if (!pushDatabase) {
        console.log("error");
        return;
      } else {
        console.log("berhasil");
      }

      await socket.broadcast.emit("chat message", msg);
    } catch (error) {
      console.log(error);
    }
  });
});

server.listen(3000, () => {
  console.log("Server listening on :3000");
});
