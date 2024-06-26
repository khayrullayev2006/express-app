import express from "express";
import { create } from "express-handlebars";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import flash from "connect-flash";
import cookieParser from "cookie-parser";
import authMiddleware from "./middlewares/var.js";
import userMiddleware from "./middlewares/user.js";
import hbsHelpers from "./utils/index.js";

// ROUTES
import AuthRouter from "./routes/auth.js";
import ProductRouter from "./routes/product.js";

dotenv.config();

const app = express();

const hbs = create({
  defaultLayout: "main",
  extname: "hbs",
  helpers: hbsHelpers,
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: "Secret", resave: false, saveUninitialized: false }));
app.use(flash());

app.use(userMiddleware);
app.use(authMiddleware);

// ROUTES
app.use(AuthRouter);
app.use(ProductRouter);

const startApp = () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => console.log("MongoDb connected"))
      .catch((error) => console.log(error));

    const PORT = process.env.PORT || 1000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
startApp();