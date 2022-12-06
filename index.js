import express, { json } from "express";
import mongoose from "mongoose";
import userRouter from "./route/user.js";
import cors from 'cors';



// initializ
const app = express();
const PORT = process.env.PORT || 3000;

// connect to database
try {
  await mongoose.connect("mongodb://localhost:27017/IS_PROJECT");
  console.log("Connected to DB!");
} catch (error) {
  console.error.bind(console, "MongoDB connection error:");
}

// middlewares
app.set('view engine', 'pug');
app.use(json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
app.use((err, req, res, next) => {
  res.status(req.status || 500).send({
    message: err.message || "Something went wrong !",
  });
  next();
});

//app.use("/uploads", express.static("uploads"));

// routes
// app.get("/", (req, res) => res.sendStatus(200));
// app.get("/api", (req, res) => res.send("Api is working..."));
// app.use("/api/wallet", walletRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/transaction", transactionRoutes);
// app.use("/api/rate", rateRouter);
// app.use("/api/news", newsRouter);
// app.use("/api/giveaway", Giveaway);
// app.use("/api/settings", Settings);
// app.use("/api/bonus", Bonus);
// app.use("/api/card", Card);
// app.use("/api/notification", Notification);
// app.use("/api/trade", trdeRouter);
// app.use("/api/giftcard", giftcardRouter);
// app.use("/api/stats", statsRouter);

app.use("/api/user", userRouter);

// 404
app.use((req, res) => {
  res.status(404).send({ message: "404 Not Found !" });
});

// start server
app.listen(PORT, () => console.log(`Server is running...`));
