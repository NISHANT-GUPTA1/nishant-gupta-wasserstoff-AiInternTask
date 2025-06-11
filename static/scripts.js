document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const parseButton = document.getElementById('parse-btn');
    const clearButton = document.getElementById('clear-btn');
    const summaryBox = document.getElementById('summary-box');
    const processedResults = document.getElementById('processed-results');
    const downloadButton = document.getElementById('download-btn');

    parseButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(uploadForm); // Create a FormData object from the form

        // Check if a file is selected
        if (formData.get('file')) {
            fetch('/parse', { // Replace with your actual endpoint
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data); // Debugging line to inspect the response structure

                if (data.results && data.results.length > 0) {
                    const result = data.results[0]; // Get the first result
                    summaryBox.value = result.summary || "Summary not available"; // Display summary in the text area

                    // Use these log statements to verify each expected field
                    console.log("Result fields:", {
                        title: result.title,
                        author: result.author,
                        keywords: result.keywords,
                        file_name: result.file_name,
                        file_path: result.file_path,
                        file_size: result.file_size,
                        time_taken_sec: result.time_taken_sec,
                        memory_usage_mb: result.memory_usage_mb
                    });

                    // Populate metadata fields
                    document.getElementById('title').querySelector('span').textContent = result.title || "N/A";
                    document.getElementById('author').querySelector('span').textContent = result.author || "N/A";
                    document.getElementById('keywords').querySelector('span').textContent = result.keywords.join(", ") || "N/A";
                    document.getElementById('filename').querySelector('span').textContent = result.file_name || "N/A";
                    document.getElementById('filepath').querySelector('span').textContent = result.file_path || "N/A";
                    document.getElementById('filesize').querySelector('span').textContent = result.file_size ? `${result.file_size} bytes` : "N/A";
                    document.getElementById('time-taken').querySelector('span').textContent = result.time_taken_sec ? `${result.time_taken_sec} seconds` : "N/A";
                    document.getElementById('memory-usage').querySelector('span').textContent = result.memory_usage_mb ? `${result.memory_usage_mb} MB` : "N/A";
                    
                    // Show processed results section
                    processedResults.classList.remove('hidden');
                    summaryBox.classList.remove('hidden');
                } else {
                    alert('Error: No results returned from the server.'); // Alert if no results
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while parsing the PDF.');
            });
        } else {
            alert('Please upload a PDF file.'); // Alert if no file is selected
        }
        
    });

    downloadButton.addEventListener('click', () => {
        const fileName = document.getElementById('filename').querySelector('span').textContent;
        
        if (!fileName || fileName === "N/A") {
            alert('No file name available for download.');
            return;
        }
        
        // Use a GET request to download the JSON file
        fetch(`/download/${encodeURIComponent(fileName)}`, {
            method: 'GET'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob(); // Expecting a blob since we're downloading a file
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}_metadata.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url); // Cleanup the URL object
        })
        .catch(error => {
            console.error('Error downloading JSON:', error);
            alert('Failed to download the JSON file.');
        });
    });
     // Clear Output functionality    
    clearButton.addEventListener('click', () => {
        summaryBox.value = ""; // Clear summary text area
        processedResults.classList.add('hidden'); // Hide processed results
        document.getElementById('title').querySelector('span').textContent = "";
        document.getElementById('author').querySelector('span').textContent = "";
        document.getElementById('keywords').querySelector('span').textContent = "";
        document.getElementById('filename').querySelector('span').textContent = "";
        document.getElementById('filepath').querySelector('span').textContent = "";
        document.getElementById('filesize').querySelector('span').textContent = "";
        document.getElementById('time-taken').querySelector('span').textContent = "";
        document.getElementById('memory-usage').querySelector('span').textContent = "";

        // Reset file input to clear selected files
        const fileInput = document.getElementById('file'); // Ensure this matches your file input element ID
        if (fileInput) {
            const newFileInput = fileInput.cloneNode(true); // Clone the file input
            fileInput.parentNode.replaceChild(newFileInput, fileInput); // Replace old input with the new one
        } else {
            console.error("File input element not found.");
        }
    });
});