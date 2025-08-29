// const mongoose = require("mongoose");

// const DataSchema = new mongoose.Schema(
//   {
//     GroupName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     rank: {
//       type: Number,
//       required: true,
//       min: 1,
//     },
//     user_id: {
//       type: Number,
//       required: true,
//     },
//     last_known_ip: {
//       type: String,
//     },
//     device: {
//       type: String,
//       enum: ["android", "ios", "web"], 
//     },
//     last_online: {
//       type: Date,
//     },
//     flags: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     probability: {
//       type: Number, // 0–1 (from Python)
//       required: true,
//       min: 0,
//       max: 1,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Prediction", DataSchema);



// const mongoose = require("mongoose");

// const DataSchema = new mongoose.Schema(
//   {
//     GroupName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     // ✅ NEW: Added field to store the total user count for the group
//     total_user: {
//       type: Number,
      
//       min: 0,
//     },
//     rank: {
//       type: Number,
//       required: true,
//       min: 1,
//     },
//     user_id: {
//       type: String, // Changed to String for better compatibility with various ID formats
//       required: true,
//     },
//     last_known_ip: {
//       type: String,
//     },
//     device: {
//       type: String,
//     },
//     last_online: {
//       type: Date,
//     },
//     flags: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     probability: {
//       type: Number, // 0–1 (from Python)
//       required: true,
//       min: 0,
//       max: 1,
//     },
//   },
//   {
//     timestamps: true, // Adds createdAt and updatedAt timestamps
//   }
// );

// module.exports = mongoose.model("Prediction", DataSchema);
const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema(
  {
    GroupName: {
      type: String,
      required: true,
      trim: true,
    },
    // ✅ CHANGED: Replaced 'total_user' with 'normal_count'
    normal_count: {
      type: Number,
      required: true, // This field should always exist
      min: 0,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
    },
    user_id: {
      type: String, // Changed to String for better compatibility with various ID formats
      required: true,
    },
    last_known_ip: {
      type: String,
    },
    device: {
      type: String,
    },
    last_online: {
      type: Date,
    },
    flags: {
      type: Number,
      default: 0,
      min: 0,
    },
    probability: {
      type: Number, // 0–1 (from Python)
      required: true,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model("Prediction", DataSchema);