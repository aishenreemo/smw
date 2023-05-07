import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import multer from "multer";
import youtubedl from "youtube-dl-exec";

const ADMINS = ["aishen", "admin"];

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

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

const quoteSchema = new mongoose.Schema({
    text: { type: String, required: true },
    emotion: { type: Number, required: true },
    views: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false },
});

const musicSchema = new mongoose.Schema({
    link: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    url: { type: String, required: true },
    views: { type: Number, default: 0 },
});

const videoSchema = new mongoose.Schema({
    link: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    videoId: { type: String, required: true },
    thumbnail: { type: String, required: true },
    views: { type: Number, default: 0 },
});

const imageSchema = new mongoose.Schema({
    data: Buffer
});

const globalSchema = new mongoose.Schema({
    emoticonCount: {
        happy: Number,
        sad: Number,
        angry: Number,
        neutral: Number,
        nervous: Number,
    },
    word: String,
});

const Quote = mongoose.model("Quote", quoteSchema);
const User = mongoose.model("User", userSchema);
const Image = mongoose.model("Image", imageSchema);
const Music = mongoose.model("Music", musicSchema);
const Video = mongoose.model("Video", videoSchema);
const Global = mongoose.model("Global", globalSchema);

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

    const token = jwt.sign({ username: user.username, admin: user.admin }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });
    res.json({ token, success: true });
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
        if (await User.findOne({ username })) throw new Error();

        await user.save();
        const token = jwt.sign({ username: user.username, admin: user.admin }, process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });
        res.json({ token, success: true });
    } catch (err) {
        res.status(409).json({ error: "Username already taken" });
    }
});

app.post("/api/logout", async (_, res) => {
    res.clearCookie("token", { httpOnly: true, sameSite: true });
    res.json({ success: true });
});

app.post("/api/add_quote", async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "Authorization token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.admin) {
            return res.status(403).json({ error: "Invalid authorization token" });
        }

        const { text, emotion } = req.body;
        const quote = new Quote({
            text,
            emotion,
        });

        await quote.save();
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: "Invalid authorization token" });
    }
});

app.post("/api/add_music", async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "Authorization token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.admin) {
            return res.status(403).json({ error: "Invalid authorization token" });
        }

        const { link } = req.body;
        const { title, duration, url } = await youtubedl(link, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            youtubeSkipDashManifest: true,
            referer: "https://www.youtube.com/",
            format: "m4a",
        });

        const music = new Music({ title, duration, link, url });

        await music.save();
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: "Invalid authorization token" });
    }
});

app.post("/api/update_global", async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "Authorization token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });

        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        await Global.deleteOne({});
        const global = new Global(req.body.global);
        await global.save();
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: "Invalid authorization token" });
    }
});

app.post("/api/add_video", async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "Authorization token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.admin) {
            return res.status(403).json({ error: "Invalid authorization token" });
        }

        const { link } = req.body;
        const { title, duration, thumbnail } = await youtubedl(link, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
            referer: "https://www.youtube.com/",
        });

        const videoId = new URL(link).searchParams.get("v");
        const video = new Video({ title, duration, link, thumbnail, videoId });

        await video.save();
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: "Invalid authorization token" });
    }
});

app.post("/api/add_pamphlet", upload.single("image"), async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "Authorization token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.admin) {
            return res.status(403).json({ error: "Invalid authorization token" });
        }

        const imageData = req.file.buffer;
        const image = new Image({ data: imageData });

        await image.save();

        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: "Invalid authorization token" });
    }
});

app.post("/api/add_view", async (req, res) => {

    if (req.body.type == "Quote") {
        const quote = await Quote.findOne({ _id: new mongoose.Types.ObjectId(req.body.id) });
        quote.views = (quote.views ?? 0);
        quote.views += 1;

        await quote.save();
    } else if (req.body.type == "Video") {
        const video = await Video.findOne({ _id: new mongoose.Types.ObjectId(req.body.id) });
        video.views = (video.views ?? 0);
        video.views += 1;

        await video.save();
    } else if (req.body.type == "Music") {
        const music = await Music.findOne({ _id: new mongoose.Types.ObjectId(req.body.id) });
        music.views = (music.views ?? 0);
        music.views += 1;

        await music.save();
    }

    res.json({ success: true });
});

app.get("/api/list_videos", async (_, res) => {
    res.json(await Video.find({}));
});

app.get("/api/list_musics", async (_, res) => {
    res.json(await Music.find({}));
});

app.get("/api/get_pamphlet/:index", async (req, res) => {
    res.json(await Image.findOne().skip(req.params.index).exec());
});

app.get("/api/count_pamphlets", async (_, res) => {
    res.json(await Image.countDocuments());
});

app.get("/api/list_quotes/:emotion", async (req, res) => {
    const emotion = req.params.emotion;

    res.json(await Quote.find({ emotion }));
});

app.get("/api/search/:string", async (req, res) => {
    res.json({
        quotes: await Quote.find({ text: { $regex: req.params.string, $options: "i" } }),
        musics: await Music.find({ title: { $regex: req.params.string, $options: "i" } }),
        videos: await Video.find({ title: { $regex: req.params.string, $options: "i" } }),
    });
});

app.get("/api/most_viewed", async (_, res) => {
    const global = await Global.findOne({});
    const list = Object.values(global.emoticonCount);

    let maxIndex = 0;
    let maxValue = list[0];

    for (let i = 1; i < list.length; i++) {
        if (list[i] > maxValue) {
            maxValue = list[i];
            maxIndex = i;
        }
    }

    res.json({
        quote: await Quote.findOne({}).sort({ views: -1 }).exec(),
        music: await Music.findOne({}).sort({ views: -1 }).exec(),
        video: await Video.findOne({}).sort({ views: -1 }).exec(),
        emoticon: maxIndex,
    });
});

app.post("/api/delete_quote", async (req, res) => {
    await Quote.deleteOne({ _id: new mongoose.Types.ObjectId(req.body.id) });
    res.send({ success: true });
});

app.post("/api/update_music", async (req, res) => {
    const music = await Music.findOne({ _id: new mongoose.Types.ObjectId(req.body.id) });
    let url = "";

    if (music) {
        let { formats } = await youtubedl(music.link, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
            referer: "https://www.youtube.com/",
        });

        url = formats.find(f => f.ext == "m4a").url;
        music.url = url;
        await music.save();
    }

    res.json(url);
});

app.post("/api/delete_music", async (req, res) => {
    await Music.deleteOne({ _id: new mongoose.Types.ObjectId(req.body.id) });
    res.send({ success: true });
});


app.post("/api/delete_video", async (req, res) => {
    await Video.deleteOne({ _id: new mongoose.Types.ObjectId(req.body.id) });
    res.send({ success: true });
});

app.post("/api/delete_pamphlet", async (req, res) => {
    await Image.deleteOne({ _id: new mongoose.Types.ObjectId(req.body.id) });
    res.send({ success: true });
});

app.get("/api/me", async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "Authorization token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        let global = await Global.findOne({});

        if (!global) {
            global = new Global({
                word: "I-WORD",
                emoticonCount: {
                    happy: 0,
                    sad: 0,
                    angry: 0,
                    neutral: 0,
                    nervous: 0,
                },
            });

            await global.save();
        }

        res.json({ success: true, user, global });
    } catch (err) {
        console.log(token);
        res.status(401).json({ error: "Invalid authorization token" });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});
