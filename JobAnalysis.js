class Job {
    constructor(jobNo, title, jobPageLink, posted, type, level, estimatedTime, skill, detail) {
        // value assignments for object properties, default values are provided if missing
        this.jobNo = jobNo || "N/A";
        this.title = title || "Unknown";
        this.jobPageLink = jobPageLink || "#";
        this.posted = this.parseTime(posted) || 0; // converted posted time to minutes to sort properly
        this.type = type || "Unknown";
        this.level = level || "Unknown";
        this.estimatedTime = estimatedTime || "Unknown";
        this.skill = skill || "Unknown";
        this.detail = detail || "No details available";
    }

    parseTime(posted) { // parse posted time into minutes (i.e. 5 mins ago)
        const timeMap = { minute: 1, hour: 60, day: 1440 };
        const match = posted.match(/(\d+)\s(\w+)/); // match time value and units
        if (match) {
            const [_, value, unit] = match;
            return parseInt(value) * (timeMap[unit] || 1); //multiply value by correct unit
        }
        return null; // return null if format does not match
    }
}

let jobs = []; // array for storing all job objects


// event listeners for file upload and filter changes
document.getElementById("fileInput").addEventListener("change", handleFileUpload);
document.getElementById("levelFilter").addEventListener("change", filterAndDisplayJobs);
document.getElementById("typeFilter").addEventListener("change", filterAndDisplayJobs);
document.getElementById("skillFilter").addEventListener("change", filterAndDisplayJobs);
document.getElementById("sortBy").addEventListener("change", filterAndDisplayJobs);


// handling of file upload and parsing of JSON data
function handleFileUpload(event) {
    const file = event.target.files[0]; // get uploaded file
    if (file) {
        const reader = new FileReader(); // read file contents
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result); // parse JSON data
                jobs = data.map( // map JSON data to job objects
                    (job) =>
                        new Job(
                            job["Job No"],
                            job.Title,
                            job["Job Page Link"],
                            job.Posted,
                            job.Type,
                            job.Level,
                            job["Estimated Time"],
                            job.Skill,
                            job.Detail
                        )
                );
                populateFilters(); // populate filter dropdowns with unique values
                displayJobs(jobs); // display all jobs on the page
            } catch (error) {
                alert("Invalid JSON file format."); // handle errors in file parsing
            }
        };
        reader.readAsText(file); // read file as text
    }
}

function populateFilters() { // extract unique values for each filter dropdown
    const levels = new Set(jobs.map((job) => job.level));
    const types = new Set(jobs.map((job) => job.type));
    const skills = new Set(jobs.map((job) => job.skill));

    // update dropdowns with unique values
    updateDropdown("levelFilter", levels);
    updateDropdown("typeFilter", types);
    updateDropdown("skillFilter", skills);
}

function updateDropdown(filterId, options) { // update dropdown function
    const dropdown = document.getElementById(filterId);
    dropdown.innerHTML = '<option value="">All</option>'; // default "All" option
    options.forEach((option) => {
        const optElement = document.createElement("option");
        optElement.value = option;
        optElement.textContent = option; // set option text
        dropdown.appendChild(optElement); // add option to dropdown
    });
}

function filterAndDisplayJobs() { // filter jobs based on selected values and sort
    const level = document.getElementById("levelFilter").value;
    const type = document.getElementById("typeFilter").value;
    const skill = document.getElementById("skillFilter").value;
    const sortBy = document.getElementById("sortBy").value;

    // filter jobs based on selected criteria
    let filteredJobs = jobs.filter(
        (job) =>
            (level === "" || job.level === level) &&
            (type === "" || job.type === type) &&
            (skill === "" || job.skill === skill)
    );

    // sort jobs based on selected criteria
    if (sortBy === "titleAsc") { // title alphabetical order (A-Z)
        filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "titleDesc") { // title alphabetical order (Z-A)
        filteredJobs.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "timeAsc") { // time postest, newest first
        filteredJobs.sort((a, b) => b.posted - a.posted);
    } else if (sortBy === "timeDesc") { // time posted, oldest first
        filteredJobs.sort((a, b) => a.posted - b.posted);
    }    

    displayJobs(filteredJobs); // display final filtered and sorted jobs
}

function displayJobs(jobs) { // display job function
    const jobListing = document.getElementById("jobListing"); 
    const modal = document.getElementById("modal"); // get job listing container and modal
    jobListing.innerHTML = ""; // clear previous job items

    jobs.forEach((job) => {
        const jobItem = document.createElement("div"); // job item container creation
        jobItem.className = "job-item"; // add class for styling
        // populate job item with job details and content
        jobItem.innerHTML = ` 
            <h3>${job.title}</h3>
            <p><strong>Posted:</strong> ${job.posted} minutes ago</p>
            <p><strong>Type:</strong> ${job.type}</p>
            <p><strong>Level:</strong> ${job.level}</p>
            <p><strong>Skill:</strong> ${job.skill}</p>
        `;

        jobItem.addEventListener("click", () => {
            // populate and display the details modal, job details includes correct line breaks for better readability
            modal.innerHTML = `
                <h2>${job.title}</h2>
                <p><strong>Type:</strong> ${job.type}</p>
                <p><strong>Level:</strong> ${job.level}</p>
                <p><strong>Skill:</strong> ${job.skill}</p>
                <p><strong>Details:</strong> ${job.detail.replace(/\n/g, '<br>')}</p> 
                <p><strong>Posted:</strong> ${job.posted} minutes ago</p>
                <button onclick="closeModal()">Close</button>
            `;
            modal.style.display = "block"; // display the details modal
        });
        jobListing.appendChild(jobItem); // add job item to list
    });
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none"; // hide the details modal
}

