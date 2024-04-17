// server.js

const express = require("express");
const AWS = require("aws-sdk");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

// Configure AWS SDK with your credentials
AWS.config.update({
        accessKeyId: "AKIA5FTY6UYULHCG6FOR",
        secretAccessKey: "KC0Z5egyb6NFq30a7x/4n2P6qKgXNYJBonQpRnTa",
        region: "us-east-1",
});

const s3 = new AWS.S3();
const kms = new AWS.KMS();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to upload a file to S3
app.post("/upload", upload.single("file"), async (req, res) => {
        const file = req.file;

        if (!file) {
                return res.status(400).send("No file uploaded");
        }

        const params = {
                Bucket: "secure-cloud-drive",
                Key: file.originalname,
                Body: fs.createReadStream(file.path),
        };

        try {
                const data = await s3.upload(params).promise();
                fs.unlinkSync(file.path); // Delete the temporary file after upload
                res.send("File uploaded successfully");
        } catch (err) {
                console.error("Error uploading file:", err);
                res.status(500).send("Error uploading file");
        }
});

// Endpoint to download and decrypt a file from S3
app.get("/download/:key", async (req, res) => {
        const { key } = req.params;

        const params = {
                Bucket: "secure-cloud-drive",
                Key: key,
        };

        try {
                const data = await s3.getObject(params).promise();
                const decryptedData = await kms
                        .decrypt({ CiphertextBlob: data.Body })
                        .promise();

                // Send decrypted file as a response
                res.attachment(key);
                res.send(decryptedData.Plaintext.toString());
        } catch (err) {
                console.error("Error downloading file:", err);
                res.status(500).send("Error downloading file");
        }
});

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Start the server
app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
});
