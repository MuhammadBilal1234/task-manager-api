const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Task = require("../models/tasks");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        Password: {
            type: String,
            required: true,
            minlength: 7,
            trim: true,
            validate(value) {
                if (value.toLowerCase().includes("password")) {
                    throw new Error('Password cannot contain "Password" ');
                }
            }
        },
        Email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Email Address is Invalid");
                }
            }
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error("Age cannot be Negative");
                }
            }
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true
                }
            }
        ],
        avatar: {
            type: Buffer
        }
    },
    {
        timestamps: true
    }
);

UserSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
});

UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.Password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

UserSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET
    );

    user.tokens = user.tokens.concat({ token });
    await user.save();
    console.log("auth");
    return token;
};

UserSchema.statics.findByCredentials = async (email, Password) => {
    const user = await User.findOne({ Email: email });

    if (!user) {
        console.log("user");
        throw new Error("Unable to Login");
    }

    const isMatch = await bcrypt.compare(Password, user.Password);

    if (!isMatch) {
        console.log("mathc");
        throw new Error("Unable to Login");
    }
    console.log("fincred");
    return user;
};

UserSchema.pre("save", async function(next) {
    const user = this;

    if (user.isModified("Password")) {
        user.Password = await bcrypt.hash(user.Password, 8);
    }

    next();
});

UserSchema.pre("remove", async function(next) {
    const user = this;

    await Task.deleteMany({ owner: user._id });

    next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
