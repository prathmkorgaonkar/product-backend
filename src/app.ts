import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/data-source";
import * as dotenv from "dotenv";
import router from "./routes";
import morganMiddleware from "./middlewares/morgan.middleware";

dotenv.config();

const PORT: number = Number(process.env.PORT);

const app = express();
app.use(cors());
app.use(express.json()); //Parse JSON Request Bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded Data, parse nested objects
app.use(morganMiddleware);
app.use("/route", router);

AppDataSource.initialize()
    .then(() => {
        app.listen(PORT, () => {
            // eslint-disable-next-line no-console
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((error: unknown) => console.error("Error initializing database", error));