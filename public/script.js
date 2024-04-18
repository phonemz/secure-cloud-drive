// public/script.js

// Function to download file from server
async function downloadFile(key) {
        try {
                const response = await fetch(`/download/${key}`);
                const blob = await response.blob();

                // Create a temporary link element
                const downloadLink = document.createElement("a");
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = key;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
        } catch (error) {
                console.error("Error downloading file:", error);
                alert("Error downloading file.");
        }
}

// Function to fetch and display list of uploaded files
async function listFiles() {
        try {
                const response = await fetch("/files");
                const files = await response.json();

                const fileListElement = document.getElementById("fileList");
                fileListElement.innerHTML = ""; // Clear existing list

                files.forEach((file) => {
                        const fileItem = document.createElement("div");
                        fileItem.classList.add("fileItem");
                        fileItem.innerHTML = `
        <p>${file.Key}</p>
        <button onclick="downloadFile('${file.Key}')">Download</button>
      `;
                        fileListElement.appendChild(fileItem);
                });
        } catch (error) {
                console.error("Error listing files:", error);
                alert("Error listing files.");
        }
}

// Event listener for file upload form submission
document.getElementById("uploadForm").addEventListener(
        "submit",
        async (event) => {
                event.preventDefault();

                const fileInput = document.getElementById("fileInput");
                const file = fileInput.files[0];

                if (!file) {
                        alert("Please select a file.");
                        return;
                }

                const formData = new FormData();
                formData.append("file", file);

                try {
                        const response = await fetch("/upload", {
                                method: "POST",
                                body: formData,
                        });

                        if (response.ok) {
                                alert("File uploaded successfully!");
                                listFiles(); // Refresh file list after upload
                        } else {
                                throw new Error("Upload failed");
                        }
                } catch (error) {
                        console.error("Error uploading file:", error);
                        alert("Error uploading file.");
                }
        }
);

// Initial file list retrieval on page load
listFiles();
