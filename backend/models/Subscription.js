const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionType: {
      type: String,
      enum: ["free", "premium", "enterprise"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    paymentId: {
      type: String,
      required: function () {
        return this.subscriptionType !== "free";
      },
    },
    features: {
      gpt3_5: {
        type: Boolean,
        default: function () {
          return (
            this.subscriptionType === "premium" ||
            this.subscriptionType === "enterprise"
          );
        },
      },
      gpt4o: {
        type: Boolean,
        default: function () {
          return this.subscriptionType === "enterprise";
        },
      },
      claude: {
        type: Boolean,
        default: function () {
          return this.subscriptionType === "enterprise";
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
