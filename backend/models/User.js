const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "请提供姓名"],
      trim: true,
      maxlength: [50, "姓名不能超过50个字符"],
    },
    email: {
      type: String,
      required: [true, "请提供邮箱"],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "请提供有效的邮箱",
      ],
    },
    password: {
      type: String,
      required: function () {
        // 只有在没有 Google 认证提供者时才需要密码
        return (
          !this.authProviders ||
          !this.authProviders.some((p) => p.provider === "google")
        );
      },
      minlength: [6, "密码至少需要6个字符"],
      select: false,
    },
    subscriptionStatus: {
      type: String,
      enum: ["free", "premium", "enterprise"],
      default: "free",
    },
    activeSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    authProviders: [
      {
        provider: {
          type: String,
          enum: ["google", "local"],
          required: true,
        },
        providerId: {
          type: String,
          required: true,
        },
        accessToken: {
          type: String,
          select: false,
        },
        lastLogin: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    googleProfile: {
      picture: String,
      given_name: String,
      family_name: String,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resumes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resume",
      },
    ],
    activeResume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
  },
  {
    timestamps: true,
  }
);

// 加密密码
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 生成JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // 30天有效期，或使用秒数如"2592000"
  });
};

// 匹配密码
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
