import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URL;

mongoose
	.connect(MONGOURL)
	.then(() => {
		console.log("Connected to DB");
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch((error) => console.log(error));

const userSchema = new mongoose.Schema({
	name: String,
	age: Number,
});

const UserModel = mongoose.model("users", userSchema);

app.use(express.json());

app.get("/getUsers", async (req, res) => {
	const userData = await UserModel.find();
	res.json(userData);
});

app.get("/getUser/:id", async (req, res) => {
	try {
		const userId = req.params.id;
		const user = await UserModel.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

app.post("/addUser", async (req, res) => {
	try {
		const { name, age } = req.body;
		if (!name || !age) {
			return res.status(400).json({ message: "Name and age are required" });
		}
		const newUser = new UserModel({ name, age });
		await newUser.save();
		res.status(201).json(newUser);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});
