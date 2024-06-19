import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	age: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, "Invalid email address"],
	},
	password: {
		type: String,
		required: true,
		minlength: [6, "Password must be at least 6 characters long"],
	},
	refreshToken: {
		type: String,
	},
});

userSchema.pre("save", async function (next) {
	if (this.isModified("password") || this.isNew) {
		try {
			const salt = await bcrypt.genSalt(10);
			this.password = await bcrypt.hash(this.password, salt);
			next();
		} catch (error) {
			next(error);
		}
	} else {
		next();
	}
});

const UserModel = mongoose.model("users", userSchema);

export default UserModel;
