import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// User model stores registered users. Passwords are hashed before save and
// are excluded from JSON outputs. The model provides a `comparePassword`
// method used by the authentication flow.

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [8, "Password must be at least 8 characters"],
			select: false,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
	},
	{ timestamps: true },
);

userSchema.pre("save", async function hashPassword(next) {
	if (!this.isModified("password")) {
		return next();
	}

	this.password = await bcrypt.hash(this.password, 12);
	return next();
});

userSchema.methods.comparePassword = function comparePassword(enteredPassword) {
	return bcrypt.compare(enteredPassword, this.password);
};

userSchema.set("toJSON", {
	transform: (_doc, ret) => {
		delete ret.password;
		return ret;
	},
});

export const User = mongoose.model("User", userSchema);
