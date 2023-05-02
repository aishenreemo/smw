import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

const ADMINS = ["aishen", "admin"];

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
}));

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "main"
}).then(() => {
    console.log("Connected to database");
}).catch((err) => {
    console.error(err);
});

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    admin: { type: bool }
});

const User = mongoose.model("User", userSchema);

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({ success: true });
});

app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
        username,
        password: hashedPassword,
        admin: ADMINS.includes(username),
    });

    try {
        await user.save();
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: "Username already taken" });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});

