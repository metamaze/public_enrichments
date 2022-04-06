import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import morgan from "morgan";
import calculateEnrichments from "./src/lead-time";

// PORT
const PORT = 5000;

// CONFIGURE DOTENV, WHICH FILE TO USE

const app = express();
// USE JSON TO PARSE BODIES
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ADDING ROUTES
app.use("/api/lead-time-purchase-order", calculateEnrichments);

const server = app.listen(PORT, console.log(`Server running on port ${PORT}`));

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
process.on("uncaughtException", shutDown);

let connections = [];
server.on("connection", (connection) => {
  connections.push(connection);
  connection.on(
    "close",
    () => (connections = connections.filter((curr) => curr !== connection))
  );
});

function shutDown(e) {
  console.log(e);
  console.log("Received kill signal, shutting down gracefully");
  server.close(() => {
    console.log("Closed out remaining connections");
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);

  connections.forEach((curr) => curr.end());
  setTimeout(() => connections.forEach((curr) => curr.destroy()), 5000);
}
