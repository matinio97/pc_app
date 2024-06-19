import express from "express";
import UserModel from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const router = express.Router();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

router.post("/register", async (req, res) => {
	try {
		const { name, age, email, password } = req.body;

		if (!name || !age || !email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const existingUser = await UserModel.findOne({
			$or: [{ email }, { name }],
		});
		if (existingUser) {
			return res
				.status(400)
				.json({ message: "Username or email already exists" });
		}

		const newUser = new UserModel({ name, age, email, password });
		await newUser.save();
		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({ message: "Email or name already exists" });
		} else if (error.name === "ValidationError") {
			return res.status(400).json({ message: error.message });
		}
		res.status(500).json({ message: error.message });
	}
});

router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const user = await UserModel.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "15m" });
		const refreshToken = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, {
			expiresIn: "14d",
		});
		user.refreshToken = refreshToken;
		await user.save();
		res.json({ token, refreshToken });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.post("/logout", async (req, res) => {
	const { refreshToken } = req.body;

	if (!refreshToken) {
		return res.status(401).json({ message: "Refresh token is required" });
	}

	try {
		const user = await UserModel.findOne({ refreshToken });
		if (!user) {
			return res.status(403).json({ message: "Invalid refresh token" });
		}
		user.refreshToken = null;
		await user.save();

		res.json({ message: "Logged out successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

router.post("/refresh-token", async (req, res) => {
	const { refreshToken } = req.body;

	if (!refreshToken) {
		return res.status(401).json({ message: "Refresh token is required" });
	}

	try {
		const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

		const user = await UserModel.findById(decoded.id);
		if (!user || user.refreshToken !== refreshToken) {
			return res.status(403).json({ message: "Invalid refresh token" });
		}

		const newRefreshToken = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, {
			expiresIn: "30d",
		});

		user.refreshToken = newRefreshToken;
		await user.save();

		const newToken = jwt.sign({ id: user._id }, JWT_SECRET, {
			expiresIn: "15m",
		});

		res.json({ token: newToken, refreshToken: newRefreshToken });
	} catch (err) {
		console.error(err);
		res.status(403).json({ message: "Invalid refresh token" });
	}
});

export default router;
