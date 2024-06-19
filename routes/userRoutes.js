import express from "express";
import UserModel from "../models/users.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/getUsers", async (req, res) => {
	try {
		const userData = await UserModel.find();
		res.json(userData);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.get("/getUser/:id", async (req, res) => {
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

// router.post("/register", async (req, res) => {
// 	try {
// 		const { name, age, email, password } = req.body;

// 		if (!name || !age || !email || !password) {
// 			return res.status(400).json({ message: "All fields are required" });
// 		}

// 		const existingUser = await UserModel.findOne({
// 			$or: [{ email }, { name }],
// 		});
// 		if (existingUser) {
// 			return res
// 				.status(400)
// 				.json({ message: "Username or email already exists" });
// 		}

// 		const newUser = new UserModel({ name, age, email, password });
// 		await newUser.save();
// 		res.status(201).json({ message: "User registered successfully" });
// 	} catch (error) {
// 		if (error.code === 11000) {
// 			return res.status(400).json({ message: "Email or name already exists" });
// 		} else if (error.name === "ValidationError") {
// 			return res.status(400).json({ message: error.message });
// 		}
// 		res.status(500).json({ message: error.message });
// 	}
// });

// router.post("/login", async (req, res) => {
// 	try {
// 		const { email, password } = req.body;

// 		if (!email || !password) {
// 			return res.status(400).json({ message: "All fields are required" });
// 		}

// 		const user = await UserModel.findOne({ email });
// 		if (!user) {
// 			return res.status(400).json({ message: "Invalid credentials" });
// 		}
// 		const isMatch = await bcrypt.compare(password, user.password);
// 		if (!isMatch) {
// 			return res.status(400).json({ message: "Invalid credentials" });
// 		}
// 		res.status(200).json({ message: "User logged in successfully" });
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
// 	}
// });

export default router;
