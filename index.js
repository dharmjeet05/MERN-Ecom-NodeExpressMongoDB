// Packages
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// My Routes
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const categoryRoutes = require("./src/routes/category");
const productRoutes = require("./src/routes/product");
const orderRoutes = require("./src/routes/order");

// Variables
const app = express();
const port = process.env.PORT || 8000;

// DB Connections
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch(() => {
    console.log("DB NOT CONNECTED PROPERLY");
  });

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);

// Starting the server
app.listen(port, () => {
  console.log(`App is up and running at port: ${port}`);
});
