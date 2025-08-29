
const express = require("express");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const cors = require("cors");
const main=require("../backend/config/DB");
require("dotenv").config();
const Prediction = require("./model/Data");
const axios=require("axios")

const app = express();

// ---------------------
// Middleware
// ---------------------
app.use(cors({
  origin: "http://localhost:3000",  // your frontend (React)
  methods: ["GET", "POST","DELETE"],
  credentials: true
}));

app.use(bodyParser.json({ limit: "50mb" }));

// ---------------------
// Prediction Route
// ---------------------
app.post("/predict", async (req, res) => {
    const { GroupName, Metadata } = req.body;
    const number = req.query.listsize;

    // ✅ 1. Get the total number of users from the uploaded metadata
    const totalUserCount = Array.isArray(Metadata) ? Metadata.length : 0;
    console.log("totalUser",totalUserCount);

    // ✅ 2. Calculate normal_count by subtracting the requested suspicious count
    // parseInt ensures the 'number' from the query is treated as an integer
    const normal_count = totalUserCount - (parseInt(number, 10) || 0);
    console.log("totalNormalUser",normal_count);

    console.log(`Total users: ${totalUserCount}, Suspicious requested: ${number}, Calculated normal_count: ${normal_count}`);

    const python = spawn("python", ["predict.py", "--topk", number]);

    let stdout = "";
    let stderr = "";

    python.stdin.write(JSON.stringify(Metadata || {}));
    python.stdin.end();

    python.stdout.on("data", (data) => { stdout += data.toString(); });
    python.stderr.on("data", (data) => { stderr += data.toString(); });

    python.on("close", async (code) => {
        console.log("=== Python stdout ===\n", stdout);
        console.log("=== Python stderr ===\n", stderr);
        console.log("=== Python exit code ===\n", code);

        if (code !== 0) {
            return res.status(500).json({ error: stderr || `Python exited with code ${code}` });
        }

        let parsed;
        try {
            parsed = JSON.parse(stdout);
        } catch (err) {
            // ... (Your JSON salvage logic) ...
            const anchor = stdout.indexOf('{"top_k"');
            if (anchor !== -1) {
                const jsonStr = stdout.slice(anchor);
                try {
                    parsed = JSON.parse(jsonStr);
                } catch (err2) {
                    return res.status(500).json({ error: "Invalid JSON from Python (salvage failed)" });
                }
            } else {
                return res.status(500).json({ error: "Invalid JSON from Python" });
            }
        }

        try {
            const response = {
                top_k: parsed.top_k || 0,
                suspicious_users: (parsed.results || []).map((u, idx) => {
                    const prob = typeof u.predicted_proba === "number" ? u.predicted_proba : null;
                    return {
                        rank: u.rank || idx + 1,
                        user_id: u.user_id || null,
                        flags: u.flag_count || u.flags || 0,
                        probability: prob,
                        probability_display: prob !== null ? `${(prob * 100).toFixed(2)}%` : null,
                        last_known_ip: u.last_known_ip || null,
                        last_online: u.last_online || null,
                        device: u.last_device_logged || null,
                    };
                }),
            };

            await Prediction.deleteMany({ GroupName });

            // ✅ 3. Insert new predictions, adding the 'normal_count' to each document
            if (response.suspicious_users.length > 0) {
                await Prediction.insertMany(
                    response.suspicious_users.map((user) => ({
                        GroupName,
                        normal_count: normal_count, // Use the count calculated above
                        ...user,
                    }))
                );
            }

            res.json(response);
        } catch (err) {
            res.status(500).json({ error: "Error preparing response", detail: err.message });
        }
    });
});


// app.post("/predict", async (req, res) => {
//     const { GroupName, Metadata } = req.body;
//     const number = req.query.listsize;
    
//     // Get the total number of users from the uploaded metadata
//     const totalUserCount = Array.isArray(Metadata) ? Metadata.length : 0;
    
//     console.log(`Total users in metadata for group '${GroupName}': ${totalUserCount}`);

//     const python = spawn("python", ["predict.py", "--topk", number]);

//     let stdout = "";
//     let stderr = "";

//     python.stdin.write(JSON.stringify(Metadata || {}));
//     python.stdin.end();

//     python.stdout.on("data", (data) => { stdout += data.toString(); });
//     python.stderr.on("data", (data) => { stderr += data.toString(); });

//     python.on("close", async (code) => {
//         // ... (logging and initial error handling code remains the same) ...
//         if (code !== 0) { /* ... */ }

//         let parsed;
//         // ... (JSON parsing and salvage logic remains the same) ...
//         try { parsed = JSON.parse(stdout); } catch (err) { /* ... */ }

//         try {
//             const response = {
//                 // ... (response mapping logic remains the same) ...
//             };

//             // ✅ Calculate the normal_count to be stored
//             const suspicious_count = response.suspicious_users.length;
//             const normal_count = totalUserCount - suspicious_count;

//             await Prediction.deleteMany({ GroupName });

//             // ✅ Insert new predictions, now storing 'normal_count' instead of 'total_user'
//             await Prediction.insertMany(
//                 response.suspicious_users.map(user => ({
//                     GroupName,
//                     normal_count: normal_count, // Store the calculated normal count
//                     ...user,
//                 }))
//             );

//             res.json(response);

//         } catch (err) {
//             res.status(500).json({ error: "Error preparing response", detail: err.message });
//         }
//     });
// });

//  app.get("/getData", async (req, res) => {
//   try {
//     console.log("chk1")
//     const data = await Prediction.aggregate([
//       {
//         $group: {
//           _id: "$GroupName",
//           users: { $push: "$$ROOT" }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           GroupName: "$_id",
//           users: {
//             $map: {
//               input: "$users",
//               as: "u",
//               in: {
//                 _id: "$$u._id",
//                 GroupName: "$$u.GroupName",
//                 rank: "$$u.rank",
//                 user_id: "$$u.user_id",
//                 last_known_ip: "$$u.last_known_ip",
//                 device: "$$u.device",
//                 last_online: "$$u.last_online",
//                 flags: "$$u.flags",
//                 probability: "$$u.probability"
//               }
//             }
//           }
//         }
//       },
//       {
//         $sort: { GroupName: 1 }
//       }
//     ]);

//     // sort users inside each group by rank ascending
//     data.forEach(group => {
//       group.users.sort((a, b) => a.rank - b.rank);
//     });

//     // calculate totals
//     const TotalGroups = data.length;
//     const SuspiciousTotal = TotalGroups * 10;

//     res.json({
//       TotalGroups,
//       SuspiciousTotal,
//       groups: data
//     });
//   } catch (err) {
//     console.error("Error fetching data:", err);
//     res.status(500).json({ error: "Failed to fetch data" });
//   }
// });



//////////////////////////////////////////////

// app.get("/getData", async (req, res) => {
//   try {
//     console.log("Fetching and processing group data...");

//     const data = await Prediction.aggregate([
//       // Stage 1: Group documents by 'GroupName'
//       {
//         $group: {
//           _id: "$GroupName",
//           // Get the total_user count from the first document in the group (it's the same for all)
//           total_user: { $first: "$total_user" },
//           // Collect all suspicious user documents for this group into an array
//           users: { $push: "$$ROOT" }
//         }
//       },
//       // Stage 2: Reshape the output
//       {
//         $project: {
//           _id: 0, // Exclude the default _id field
//           GroupName: "$_id",
//           // ✅ Calculate the number of normal users for this group
//           normal_count: {
//             // Subtract the number of suspicious users from the total
//             $subtract: ["$total_user", { $size: "$users" }]
//           },
//           // Keep the array of suspicious users, but clean up the fields
//           users: {
//             $map: {
//               input: "$users",
//               as: "u",
//               in: {
//                 _id: "$$u._id",
//                 GroupName: "$$u.GroupName",
//                 rank: "$$u.rank",
//                 user_id: "$$u.user_id",
//                 last_known_ip: "$$u.last_known_ip",
//                 device: "$$u.device",
//                 last_online: "$$u.last_online",
//                 flags: "$$u.flags",
//                 probability: "$$u.probability"
//               }
//             }
//           }
//         }
//       },
//       // Stage 3: Sort the final groups alphabetically by name
//       {
//         $sort: { GroupName: 1 }
//       }
//     ]);

//     // Sort the suspicious users within each group by their rank
//     data.forEach(group => {
//       group.users.sort((a, b) => a.rank - b.rank);
//     });

//     // ✅ Calculate the new totals using the data from the aggregation
//     const TotalGroups = data.length;
//     // Sum of all suspicious users across all groups
//     const SuspiciousTotal = data.reduce((sum, group) => sum + group.users.length, 0);
//     // Sum of all normal users across all groups
//     const NormalTotal = data.reduce((sum, group) => sum + group.normal_count, 0);

//     // Send the final, enriched data to the frontend
//     res.json({
//       TotalGroups,
//       SuspiciousTotal,
//       NormalTotal, // Add the new total for the stat card
//       groups: data // Each group object in this array now includes the 'normal_count'
//     });

//   } catch (err) {
//     console.error("Error fetching data:", err);
//     res.status(500).json({ error: "Failed to fetch data" });
//   }
// });

app.get("/getData", async (req, res) => {
  try {
    console.log("Fetching and processing group data...");

    const data = await Prediction.aggregate([
      // Stage 1: Group documents by 'GroupName'
      {
        $group: {
          _id: "$GroupName",
          // ✅ FIX: Get 'normal_count' from the first document in the group
          normal_count: { $first: "$normal_count" },
          // Collect all suspicious user documents for this group into an array
          users: { $push: "$$ROOT" }
        }
      },
      // Stage 2: Reshape the output
      {
        $project: {
          _id: 0, // Exclude the default _id field
          GroupName: "$_id",
          normal_count: 1, // Pass the 'normal_count' field through
          // Keep the array of suspicious users, but clean up the fields
          users: {
            $map: {
              input: "$users",
              as: "u",
              in: {
                _id: "$$u._id",
                GroupName: "$$u.GroupName",
                rank: "$$u.rank",
                user_id: "$$u.user_id",
                last_known_ip: "$$u.last_known_ip",
                device: "$$u.device",
                last_online: "$$u.last_online",
                flags: "$$u.flags",
                probability: "$$u.probability"
              }
            }
          }
        }
      },
      // Stage 3: Sort the final groups alphabetically by name
      {
        $sort: { GroupName: 1 }
      }
    ]);

    // Sort the suspicious users within each group by their rank
    data.forEach(group => {
      group.users.sort((a, b) => a.rank - b.rank);
    });

    // Calculate the totals using the data from the aggregation
    const TotalGroups = data.length;
    const SuspiciousTotal = data.reduce((sum, group) => sum + group.users.length, 0);
    const NormalTotal = data.reduce((sum, group) => sum + group.normal_count, 0);

    // Send the final, enriched data to the frontend
    res.json({
      TotalGroups,
      SuspiciousTotal,
      NormalTotal,
      groups: data
    });

  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.delete("/deleteGroup/:groupToDelete", async (req, res) => {
  try {
    const { groupToDelete } = req.params;

    if (!groupToDelete) {
      return res.status(400).json({ error: "Group name is required." });
    }

    const result = await Prediction.deleteMany({ GroupName: groupToDelete });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Group not found." });
    }

    console.log(`Deleted group: ${groupToDelete} (${result.deletedCount} users removed)`);

    // ✅ FIX: Use the correct variable name 'groupToDelete' in the response message
    res.status(200).json({
      message: `Group '${groupToDelete}' was successfully deleted.`
    });

  } catch (err) {
    console.error("Error during group deletion:", err);
    res.status(500).json({ error: "Failed to delete group due to a server error." });
  }
});

//PROXY-SERVER
app.get('/api/ip-info/:ip', async (req, res) => {
  console.log("hii")
  const { ip } = req.params;
  const IPINFO_TOKEN = process.env.IPINFO_TOKEN;

  if (!ip) {
    return res.status(400).json({ error: 'IP address is required' });
  }

  try {
    console.log(`Fetching info for IP: ${ip}`);
    
    // The backend makes the secure call to ipinfo.io
    const response = await axios.get(`https://ipinfo.io/${ip}`);
    
    // Send the data from ipinfo.io back to your frontend
    res.json(response.data);

  } catch (error) {
    console.error('Error fetching from ipinfo.io:', error.message);
    res.status(500).json({ error: 'Failed to fetch IP information.' });
  }
});


// ---------------------
// Start Server
// ---------------------
const InitializeConnection=async()=>{
    try{
        
       await main()
       console.log("DB Connected");
       app.listen(process.env.PORT,()=>{
     console.log("listening on port "+ process.env.PORT);
 })
    }

   catch(err){
    console.log("Error:"+err);
   }
}
InitializeConnection();

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
