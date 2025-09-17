// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCrJ6Ur1HLGX97ggVfeFQc65l16oq8k9kg",
    authDomain: "webar-c2cf1.firebaseapp.com",
    databaseURL: "https://webar-c2cf1-default-rtdb.firebaseio.com",
    projectId: "webar-c2cf1",
    storageBucket: "webar-c2cf1.firebasestorage.app",
    messagingSenderId: "1019363026928",
    appId: "1:1019363026928:web:9d25a79d8052527c02df35",
    measurementId: "G-7JYSEJDPRP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Track authentication state
let isLoggedIn = false;
let userType = null;
let currentUser = null;
let jobListings = [];
let myPostedJobs = [];
let savedJobs = [];
let appliedJobs = [];
let companies = [];
let jobApplications = {};

// Sample job data with Indian currency and contact details
const sampleJobs = [
    {
        id: 1,
        title: "Senior UX Designer",
        company: "Tech Solutions India",
        location: "Mumbai, Maharashtra",
        type: "Full-time",
        salary: "₹12,00,000 - ₹14,50,000",
        posted: "2 days ago",
        postedDate: "2023-10-20",
        contact: "+919876543210",
        tags: ["UX", "UI", "Figma", "Product Design"],
        description: "We are looking for an experienced UX Designer to join our team and help create amazing user experiences for our products.",
        logo: "tech",
        whatsapp: "+919876543210",
        openings: 3
    },
    {
        id: 2,
        title: "Frontend Developer",
        company: "Digital Innovations Pvt Ltd",
        location: "Bangalore, Karnataka",
        type: "Full-time",
        salary: "₹8,00,000 - ₹11,00,000",
        posted: "1 day ago",
        postedDate: "2023-10-21",
        contact: "+919765432109",
        tags: ["React", "JavaScript", "CSS", "TypeScript"],
        description: "Join our frontend team to build responsive and accessible web applications using modern JavaScript frameworks.",
        logo: "digital",
        whatsapp: "+919765432109",
        openings: 5
    },
    {
        id: 3,
        title: "iOS Developer",
        company: "AppCreators India",
        location: "Hyderabad, Telangana",
        type: "NAPS",
        salary: "₹9,00,000 - ₹13,00,000",
        posted: "3 days ago",
        postedDate: "2023-10-19",
        contact: "+919654321098",
        tags: ["Swift", "iOS", "Xcode", "Objective-C"],
        description: "We're seeking an iOS Developer with a passion for building elegant and performant mobile applications.",
        logo: "appcreators",
        whatsapp: "+919654321098",
        openings: 2
    }
];

// Sample companies data
const sampleCompanies = [
    {
        id: 1,
        name: "Tech Solutions India",
        description: "A leading technology company specializing in IT services and digital solutions.",
        jobs: 15,
        logo: "tech"
    },
    {
        id: 2,
        name: "Digital Innovations Pvt Ltd",
        description: "A digital transformation company helping businesses evolve with technology.",
        jobs: 12,
        logo: "digital"
    },
    {
        id: 3,
        name: "AppCreators India",
        description: "Mobile app development company creating innovative solutions for businesses.",
        jobs: 8,
        logo: "appcreators"
    },
    {
        id: 4,
        name: "SoftTech Systems",
        description: "Enterprise software solutions provider with a focus on innovation.",
        jobs: 10,
        logo: "softtech"
    },
    {
        id: 5,
        name: "DataMinds Analytics",
        description: "Data analytics and business intelligence solutions company.",
        jobs: 7,
        logo: "dataminds"
    },
    {
        id: 6,
        name: "CloudNova Technologies",
        description: "Cloud computing and infrastructure solutions provider.",
        jobs: 9,
        logo: "cloudnova"
    }
];

// Sample job applications
const sampleApplications = {
    1: [
        {
            name: "Rahul Sharma",
            email: "rahul.sharma@example.com",
            phone: "+91 98765 43210",
            appliedDate: "2023-10-21",
            resume: "rahul_sharma_resume.pdf",
            coverLetter: "I am excited to apply for the Senior UX Designer position with 5 years of experience in product design."
        },
        {
            name: "Priya Patel",
            email: "priya.patel@example.com",
            phone: "+91 97654 32109",
            appliedDate: "2023-10-22",
            resume: "priya_patel_resume.pdf",
            coverLetter: "I have extensive experience in UX design and believe I would be a great fit for your team."
        }
    ],
    2: [
        {
            name: "Amit Kumar",
            email: "amit.kumar@example.com",
            phone: "+91 96543 21098",
            appliedDate: "2023-10-22",
            resume: "amit_kumar_resume.pdf",
            coverLetter: "As a frontend developer with 4 years of experience, I am excited about this opportunity."
        }
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        
        if (mainNav.classList.contains('active')) {
            mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Load sample jobs, companies, and applications
    jobListings = [...sampleJobs];
    companies = [...sampleCompanies];
    jobApplications = {...sampleApplications};
    renderJobListings();
    renderCompanies();
    
    // Password toggle functionality
    setupPasswordToggle('login-password', 'login-password-toggle');
    setupPasswordToggle('register-password', 'register-password-toggle');
    setupPasswordToggle('register-confirm', 'register-confirm-toggle');
    setupPasswordToggle('current-password', 'current-password-toggle');
    setupPasswordToggle('new-password', 'new-password-toggle');
    setupPasswordToggle('confirm-password', 'confirm-password-toggle');
    
    // User type selection
    const userTypeBtns = document.querySelectorAll('.user-type-btn');
    userTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            userTypeBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            userType = this.getAttribute('data-type');
        });
    });
    
    // Tab functionality for My Jobs page
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Load content for the selected tab
            if (tabId === 'posted') {
                renderMyPostedJobs();
            } else if (tabId === 'saved') {
                renderSavedJobs();
            } else if (tabId === 'applications') {
                renderAppliedJobs();
            }
        });
    });
    
    // Form submissions
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Firebase authentication
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                isLoggedIn = true;
                
                // Get user data from Firestore
                db.collection('users').doc(user.uid).get()
                    .then((doc) => {
                        if (doc.exists) {
                            currentUser = doc.data();
                            currentUser.uid = user.uid;
                            updateNavigation();
                            showPage('dashboard');
                            showToast('Login successful!');
                        } else {
                            showToast('User data not found', true);
                        }
                    })
                    .catch((error) => {
                        showToast('Error getting user data: ' + error.message, true);
                    });
            })
            .catch((error) => {
                showToast('Login error: ' + error.message, true);
            });
    });
    
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        
        if (password !== confirm) {
            showToast('Passwords do not match!', true);
            return;
        }
        
        if (!userType) {
            showToast('Please select a user type', true);
            return;
        }
        
        // Firebase authentication
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up
                const user = userCredential.user;
                
                // Save user data to Firestore
                db.collection('users').doc(user.uid).set({
                    name: name,
                    email: email,
                    type: userType,
                    phone: "+91 00000 00000",
                    location: "India",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    isLoggedIn = true;
                    currentUser = {
                        uid: user.uid,
                        name: name,
                        email: email,
                        type: userType,
                        phone: "+91 00000 00000",
                        location: "India"
                    };
                    updateNavigation();
                    showPage('dashboard');
                    showToast('Account created successfully!');
                })
                .catch((error) => {
                    showToast('Error saving user data: ' + error.message, true);
                });
            })
            .catch((error) => {
                showToast('Registration error: ' + error.message, true);
            });
    });
    
    // Job post form submission
    document.getElementById('job-post-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('job-title').value;
        const company = document.getElementById('company-name').value;
        const location = document.getElementById('job-location').value;
        const type = document.getElementById('job-type').value;
        const salary = document.getElementById('job-salary').value;
        const contact = document.getElementById('job-contact').value;
        const description = document.getElementById('job-description').value;
        const requirements = document.getElementById('job-requirements').value;
        
        // Add job to Firestore
        db.collection('jobs').add({
            title: title,
            company: company,
            location: location,
            type: type,
            salary: salary,
            contact: contact,
            description: description,
            requirements: requirements,
            postedBy: currentUser.uid,
            postedAt: firebase.firestore.FieldValue.serverTimestamp(),
            tags: requirements.split(',').map(tag => tag.trim()),
            logo: "building",
            openings: 1
        })
        .then((docRef) => {
            // Add new job to listings
            const newJob = {
                id: docRef.id,
                title: title,
                company: company,
                location: location,
                type: type,
                salary: salary,
                posted: "Just now",
                postedDate: new Date().toISOString().split('T')[0],
                contact: contact,
                whatsapp: contact.replace(/\D/g, ''),
                tags: requirements.split(',').map(tag => tag.trim()),
                description: description,
                logo: "building",
                openings: 1
            };
            
            jobListings.unshift(newJob);
            myPostedJobs.unshift(newJob);
            
            // Initialize empty applications array for this job
            jobApplications[newJob.id] = [];
            
            // Re-render job listings
            renderJobListings();
            
            // Close modal and reset form
            closeJobPostModal();
            this.reset();
            
            showToast('Job posted successfully!');
        })
        .catch((error) => {
            showToast('Error posting job: ' + error.message, true);
        });
    });
    
    // Edit job form submission
    document.getElementById('edit-job-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const jobId = document.getElementById('edit-job-id').value;
        const title = document.getElementById('edit-job-title').value;
        const company = document.getElementById('edit-company-name').value;
        const location = document.getElementById('edit-job-location').value;
        const type = document.getElementById('edit-job-type').value;
        const salary = document.getElementById('edit-job-salary').value;
        const contact = document.getElementById('edit-job-contact').value;
        const description = document.getElementById('edit-job-description').value;
        const requirements = document.getElementById('edit-job-requirements').value;
        
        // Update job in Firestore
        db.collection('jobs').doc(jobId).update({
            title: title,
            company: company,
            location: location,
            type: type,
            salary: salary,
            contact: contact,
            description: description,
            requirements: requirements,
            tags: requirements.split(',').map(tag => tag.trim())
        })
        .then(() => {
            // Find job in myPostedJobs and update
            const jobIndex = myPostedJobs.findIndex(job => job.id === jobId);
            if (jobIndex !== -1) {
                myPostedJobs[jobIndex] = {
                    ...myPostedJobs[jobIndex],
                    title: title,
                    company: company,
                    location: location,
                    type: type,
                    salary: salary,
                    contact: contact,
                    whatsapp: contact.replace(/\D/g, ''),
                    description: description,
                    tags: requirements.split(',').map(tag => tag.trim()),
                    openings: 1
                };
            }
            
            // Also update in main job listings if it exists there
            const mainJobIndex = jobListings.findIndex(job => job.id === jobId);
            if (mainJobIndex !== -1) {
                jobListings[mainJobIndex] = {
                    ...jobListings[mainJobIndex],
                    title: title,
                    company: company,
                    location: location,
                    type: type,
                    salary: salary,
                    contact: contact,
                    whatsapp: contact.replace(/\D/g, ''),
                    description: description,
                    tags: requirements.split(',').map(tag => tag.trim()),
                    openings: 1
                };
            }
            
            // Re-render job listings
            renderJobListings();
            renderMyPostedJobs();
            
            // Close modal
            closeEditJobModal();
            
            showToast('Job updated successfully!');
        })
        .catch((error) => {
            showToast('Error updating job: ' + error.message, true);
        });
    });
    
    // Settings form submissions
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('profile-name').value;
        const email = document.getElementById('profile-email').value;
        const phone = document.getElementById('profile-phone').value;
        const location = document.getElementById('profile-location').value;
        const bio = document.getElementById('profile-bio').value;
        
        if (currentUser) {
            // Update user in Firestore
            db.collection('users').doc(currentUser.uid).update({
                name: name,
                email: email,
                phone: phone,
                location: location,
                bio: bio
            })
            .then(() => {
                currentUser.name = name;
                currentUser.email = email;
                currentUser.phone = phone;
                currentUser.location = location;
                currentUser.bio = bio;
                updateNavigation();
                
                // Update email display on My Jobs page
                document.getElementById('profile-email-display').textContent = email;
                
                showToast('Profile updated successfully!');
            })
            .catch((error) => {
                showToast('Error updating profile: ' + error.message, true);
            });
        }
    });
    
    document.getElementById('language-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const language = document.getElementById('language-select').value;
        if (language === 'marathi') {
            showToast('Marathi language support will be available soon!');
        } else {
            showToast('Language preference set to English');
        }
    });
    
    document.getElementById('security-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match!', true);
            return;
        }
        
        // Update password in Firebase
        const user = auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email, 
            currentPassword
        );
        
        user.reauthenticateWithCredential(credential)
            .then(() => {
                user.updatePassword(newPassword)
                    .then(() => {
                        this.reset();
                        showToast('Password updated successfully!');
                    })
                    .catch((error) => {
                        showToast('Error updating password: ' + error.message, true);
                    });
            })
            .catch((error) => {
                showToast('Current password is incorrect', true);
            });
    });
    
    document.getElementById('notifications-form').addEventListener('submit', function(e) {
        e.preventDefault();
        showToast('Notification preferences saved!');
    });
    
    // User dropdown toggle
    const userMenu = document.getElementById('userMenu');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenu) {
        userMenu.addEventListener('click', function(e) {
            userDropdown.classList.toggle('active');
            e.stopPropagation();
        });
    }
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', function() {
        if (userDropdown) userDropdown.classList.remove('active');
    });
    
    // Load jobs from Firebase
    loadJobsFromFirebase();
    
    // Show the dashboard page by default
    showPage('dashboard');
    updateNavigation();
    
    // Add search functionality
    document.getElementById('searchButton').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});

// Load jobs from Firebase
function loadJobsFromFirebase() {
    db.collection('jobs').orderBy('postedAt', 'desc').get()
        .then((querySnapshot) => {
            jobListings = [];
            querySnapshot.forEach((doc) => {
                const job = doc.data();
                job.id = doc.id;
                jobListings.push(job);
            });
            renderJobListings();
        })
        .catch((error) => {
            showToast('Error loading jobs: ' + error.message, true);
        });
}

// Setup password toggle functionality
function setupPasswordToggle(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = document.getElementById(toggleId);
    
    if (passwordInput && toggleButton) {
        toggleButton.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }
}

// Perform search functionality
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (searchTerm === '') {
        renderJobListings();
        return;
    }
    
    const filteredJobs = jobListings.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        job.description.toLowerCase().includes(searchTerm)
    );
    
    renderFilteredJobListings(filteredJobs);
}

// Render filtered job listings
function renderFilteredJobListings(filteredJobs) {
    const listingsContainer = document.getElementById('jobListingsContainer');
    
    if (!listingsContainer) return;
    
    listingsContainer.innerHTML = '';
    
    if (filteredJobs.length === 0) {
        listingsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No jobs found</h3>
                <p>Try different search terms or browse all jobs</p>
            </div>
        `;
        return;
    }
    
    filteredJobs.forEach(job => {
        const jobCard = createJobCard(job);
        listingsContainer.appendChild(jobCard);
    });
}

// Create job card element
function createJobCard(job) {
    const jobCard = document.createElement('div');
    jobCard.className = 'job-card';
    jobCard.dataset.id = job.id;
    
    // Get logo class based on company
    let logoClass = 'fas fa-building';
    if (job.logo === 'tech') logoClass = 'fas fa-laptop-code';
    if (job.logo === 'digital') logoClass = 'fas fa-digital-tachograph';
    if (job.logo === 'appcreators') logoClass = 'fas fa-mobile-alt';
    
    // Check if job is saved
    const isSaved = savedJobs.some(savedJob => savedJob.id === job.id);
    const isApplied = appliedJobs.some(appliedJob => appliedJob.id === job.id);
    
    jobCard.innerHTML = `
        <div class="job-card-header">
            <div class="company-logo">
                <i class="${logoClass}"></i>
            </div>
            <div class="job-info">
                <h3>${job.title}</h3>
                <p>${job.company} • ${job.location}</p>
            </div>
            <span class="job-type">${job.type}</span>
            <button class="save-btn ${isSaved ? 'saved' : ''}" onclick="toggleSaveJob('${job.id}')">
                <i class="fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark'}"></i>
            </button>
        </div>
        <div class="job-details">
            <div class="detail-row">
                <div class="detail-item">
                    <i class="fas fa-rupee-sign"></i>
                    <span class="salary">${job.salary}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>${job.posted || 'Recently posted'}</span>
                </div>
            </div>
            <div class="job-tags">
                ${job.tags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
            </div>
            <p>${job.description}</p>
            <div class="job-actions">
                <a href="tel:${job.contact}" class="action-btn call-btn">
                    <i class="fas fa-phone"></i> Call
                </a>
                <a href="https://wa.me/${job.whatsapp}" target="_blank" class="action-btn whatsapp-btn">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
                <button class="action-btn apply-btn ${isApplied ? 'applied' : ''}" onclick="handleApply('${job.id}')">
                    <i class="fas fa-paper-plane"></i> ${isApplied ? 'Applied' : 'Apply'}
                </button>
            </div>
        </div>
    `;
    
    return jobCard;
}

// Render job listings
function renderJobListings() {
    const listingsContainer = document.getElementById('jobListingsContainer');
    
    if (!listingsContainer) return;
    
    listingsContainer.innerHTML = '';
    
    jobListings.forEach(job => {
        const jobCard = createJobCard(job);
        listingsContainer.appendChild(jobCard);
    });
}

// Render companies
function renderCompanies() {
    const companiesContainer = document.getElementById('companiesGrid');
    if (!companiesContainer) return;
    
    companiesContainer.innerHTML = '';
    
    companies.forEach(company => {
        const companyCard = document.createElement('div');
        companyCard.className = 'company-card';
        companyCard.dataset.id = company.id;
        
        // Get logo class based on company
        let logoClass = 'fas fa-building';
        if (company.logo === 'tech') logoClass = 'fas fa-laptop-code';
        if (company.logo === 'digital') logoClass = 'fas fa-digital-tachograph';
        if (company.logo === 'appcreators') logoClass = 'fas fa-mobile-alt';
        if (company.logo === 'softtech') logoClass = 'fas fa-code';
        if (company.logo === 'dataminds') logoClass = 'fas fa-chart-line';
        if (company.logo === 'cloudnova') logoClass = 'fas fa-cloud';
        
        companyCard.innerHTML = `
            <div class="company-logo-large">
                <i class="${logoClass}"></i>
            </div>
            <div class="company-info">
                <h3>${company.name}</h3>
                <p>${company.description}</p>
                <div class="company-jobs">${company.jobs} open positions</div>
            </div>
        `;
        
        companiesContainer.appendChild(companyCard);
    });
}

// Render my posted jobs
function renderMyPostedJobs() {
    const listingsContainer = document.getElementById('postedJobsContainer');
    if (!listingsContainer) return;
    
    // Load employer's jobs from Firebase
    if (currentUser && currentUser.type === 'employer') {
        db.collection('jobs').where('postedBy', '==', currentUser.uid).get()
            .then((querySnapshot) => {
                myPostedJobs = [];
                querySnapshot.forEach((doc) => {
                    const job = doc.data();
                    job.id = doc.id;
                    myPostedJobs.push(job);
                });
                
                if (myPostedJobs.length === 0) {
                    listingsContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-briefcase"></i>
                            <h3>No jobs posted yet</h3>
                            <p>You haven't posted any jobs yet. Get started by posting your first job!</p>
                            <button class="view-more-btn" onclick="openJobPostModal()">Post a Job</button>
                        </div>
                    `;
                    return;
                }
                
                listingsContainer.innerHTML = '';
                
                myPostedJobs.forEach(job => {
                    const jobCard = document.createElement('div');
                    jobCard.className = 'job-card';
                    jobCard.dataset.id = job.id;
                    
                    // Get logo class based on company
                    let logoClass = 'fas fa-building';
                    if (job.logo === 'tech') logoClass = 'fas fa-laptop-code';
                    if (job.logo === 'digital') logoClass = 'fas fa-digital-tachograph';
                    if (job.logo === 'appcreators') logoClass = 'fas fa-mobile-alt';
                    
                    const applications = jobApplications[job.id] || [];
                    
                    jobCard.innerHTML = `
                        <div class="job-card-header">
                            <div class="company-logo">
                                <i class="${logoClass}"></i>
                            </div>
                            <div class="job-info">
                                <h3>${job.title}</h3>
                                <p>${job.company} • ${job.location}</p>
                            </div>
                            <span class="job-type">${job.type}</span>
                        </div>
                        <div class="job-details">
                            <div class="detail-row">
                                <div class="detail-item">
                                    <i class="fas fa-rupee-sign"></i>
                                    <span class="salary">${job.salary}</span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-clock"></i>
                                    <span>${job.posted || 'Recently posted'}</span>
                                </div>
                            </div>
                            <div class="job-tags">
                                ${job.tags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
                            </div>
                            <p>${job.description}</p>
                            <div class="job-actions">
                                <button class="action-btn apply-btn" onclick="viewApplications('${job.id}')">
                                    <i class="fas fa-eye"></i> View Applications (${applications.length})
                                </button>
                                <button class="action-btn call-btn" onclick="editJob('${job.id}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="action-btn whatsapp-btn" onclick="handleDeleteJob('${job.id}')">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                                <button class="action-btn save-btn-settings" onclick="shareJob('${job.id}')">
                                    <i class="fas fa-share-alt"></i> Share
                                </button>
                            </div>
                        </div>
                    `;
                    
                    listingsContainer.appendChild(jobCard);
                });
            })
            .catch((error) => {
                showToast('Error loading your jobs: ' + error.message, true);
            });
    }
}

// Render saved jobs
function renderSavedJobs() {
    const listingsContainer = document.querySelector('#saved-tab .job-listings');
    if (!listingsContainer) return;
    
    if (savedJobs.length === 0) {
        listingsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark"></i>
                <h3>No saved jobs</h3>
                <p>You haven't saved any jobs yet. Start browsing jobs to save them for later!</p>
                <button class="view-more-btn" onclick="showPage('dashboard')">Browse Jobs</button>
            </div>
        `;
        return;
    }
    
    listingsContainer.innerHTML = '';
    
    savedJobs.forEach(job => {
        const jobCard = createJobCard(job);
        listingsContainer.appendChild(jobCard);
    });
}

// Render applied jobs
function renderAppliedJobs() {
    const listingsContainer = document.querySelector('#applications-tab .job-listings');
    if (!listingsContainer) return;
    
    if (appliedJobs.length === 0) {
        listingsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <h3>No applications yet</h3>
                <p>You haven't applied to any jobs yet. Start browsing jobs to apply!</p>
                <button class="view-more-btn" onclick="showPage('dashboard')">Browse Jobs</button>
            </div>
        `;
        return;
    }
    
    listingsContainer.innerHTML = '';
    
    appliedJobs.forEach(job => {
        const jobCard = createJobCard(job);
        listingsContainer.appendChild(jobCard);
    });
}

// Render applications for a job
function renderApplications(jobId) {
    const applicationsContainer = document.getElementById('applicationsList');
    if (!applicationsContainer) return;
    
    applicationsContainer.innerHTML = '';
    
    const applications = jobApplications[jobId] || [];
    
    if (applications.length === 0) {
        applicationsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-times"></i>
                <h3>No applications yet</h3>
                <p>No one has applied to this job yet.</p>
            </div>
        `;
        return;
    }
    
    applications.forEach((application, index) => {
        const applicationItem = document.createElement('div');
        applicationItem.className = 'application-item';
        
        applicationItem.innerHTML = `
            <div class="application-details">
                <h4>${application.name}</h4>
                <p><i class="fas fa-envelope"></i> ${application.email}</p>
                <p><i class="fas fa-phone"></i> ${application.phone}</p>
                <p><i class="fas fa-calendar"></i> Applied on: ${application.appliedDate}</p>
                <p><strong>Cover Letter:</strong> ${application.coverLetter}</p>
            </div>
            <div class="application-actions">
                <a href="tel:${application.phone}" class="action-btn call-btn">
                    <i class="fas fa-phone"></i> Call
                </a>
                <a href="https://wa.me/${application.phone.replace(/\D/g, '')}" target="_blank" class="action-btn whatsapp-btn">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
                <a href="#" class="action-btn apply-btn">
                    <i class="fas fa-download"></i> Resume
                </a>
            </div>
        `;
        
        applicationsContainer.appendChild(applicationItem);
    });
}

// Handle apply action
function handleApply(jobId) {
    if (!isLoggedIn) {
        showToast('Please login to apply for jobs', true);
        showPage('login');
        return;
    }
    
    const job = jobListings.find(j => j.id === jobId);
    if (job && !appliedJobs.some(j => j.id === jobId)) {
        appliedJobs.push(job);
        
        // Add sample application
        if (!jobApplications[jobId]) {
            jobApplications[jobId] = [];
        }
        
        jobApplications[jobId].push({
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone,
            appliedDate: new Date().toISOString().split('T')[0],
            resume: "my_resume.pdf",
            coverLetter: `I am interested in the ${job.title} position at ${job.company} and believe my skills are a good match for this role.`
        });
        
        showToast(`Successfully applied for ${job.title} at ${job.company}!`);
        renderJobListings();
        
        // If we're on the applications tab, refresh it
        if (document.getElementById('applications-tab').classList.contains('active')) {
            renderAppliedJobs();
        }
    } else {
        showToast('You have already applied for this job');
    }
}

// Toggle save job action
function toggleSaveJob(jobId) {
    if (!isLoggedIn) {
        showToast('Please login to save jobs', true);
        showPage('login');
        return;
    }
    
    const job = jobListings.find(j => j.id === jobId);
    const savedJobIndex = savedJobs.findIndex(j => j.id === jobId);
    
    if (savedJobIndex !== -1) {
        // Already saved, so remove it
        savedJobs.splice(savedJobIndex, 1);
        showToast(`Removed ${job.title} at ${job.company} from your saved jobs`);
    } else {
        // Not saved, so add it
        savedJobs.push(job);
        showToast(`Saved ${job.title} at ${job.company} to your saved jobs!`);
    }
    
    renderJobListings();
    
    // Refresh the appropriate view
    if (document.getElementById('saved-tab').classList.contains('active')) {
        renderSavedJobs();
    }
}

// View applications for a job
function viewApplications(jobId) {
    const job = myPostedJobs.find(j => j.id === jobId);
    if (job) {
        document.getElementById('applicationsModal').classList.add('active');
        renderApplications(jobId);
    }
}

// Edit job action
function editJob(jobId) {
    const job = myPostedJobs.find(j => j.id === jobId);
    if (job) {
        document.getElementById('edit-job-id').value = job.id;
        document.getElementById('edit-job-title').value = job.title;
        document.getElementById('edit-company-name').value = job.company;
        document.getElementById('edit-job-location').value = job.location;
        document.getElementById('edit-job-type').value = job.type;
        document.getElementById('edit-job-salary').value = job.salary;
        document.getElementById('edit-job-contact').value = job.contact;
        document.getElementById('edit-job-description').value = job.description;
        document.getElementById('edit-job-requirements').value = job.tags.join(', ');
        
        document.getElementById('editJobModal').classList.add('active');
    }
}

// Handle delete job action
function handleDeleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job posting?')) {
        // Delete job from Firebase
        db.collection('jobs').doc(jobId).delete()
            .then(() => {
                const jobIndex = myPostedJobs.findIndex(j => j.id === jobId);
                if (jobIndex !== -1) {
                    const job = myPostedJobs[jobIndex];
                    myPostedJobs.splice(jobIndex, 1);
                    
                    // Also remove from main job listings if it exists there
                    const mainJobIndex = jobListings.findIndex(j => j.id === jobId);
                    if (mainJobIndex !== -1) {
                        jobListings.splice(mainJobIndex, 1);
                    }
                    
                    showToast(`Deleted job: ${job.title} at ${job.company}`);
                    renderMyPostedJobs();
                    renderJobListings();
                }
            })
            .catch((error) => {
                showToast('Error deleting job: ' + error.message, true);
            });
    }
}

// Share job action
function shareJob(jobId) {
    const job = myPostedJobs.find(j => j.id === jobId);
    if (job) {
        document.getElementById('shareJobModal').classList.add('active');
        
        // Format the job details in the requested format
        const shareContent = `
🏢 ${job.company} – ${job.location}

📢 ${job.title}

🔧 𝗣𝗼𝘀𝗶𝘁𝗶𝗼𝗻: ${job.title}
🎓 𝗘𝗱𝘂𝗰𝗮𝘁𝗶𝗼𝗻: 𝟭𝟬𝘁𝗵, 𝟭𝟮𝘁𝗵, 𝗜𝗧𝗜, 𝗗𝗶𝗽𝗹𝗼𝗺𝗮, 𝗚𝗿𝗮𝗱𝘂𝗮𝗹𝘁𝗶𝗼𝗻 (𝗔𝗻𝘆)
💼 𝗘𝘅𝗽𝗲𝗿𝗶𝗲𝗻𝗰𝗲: 𝗙𝗿𝗲𝘀𝗵𝗲𝗿 ✅
💰 𝗦𝗮𝗹𝗮𝗿𝘆: ${job.salary} / 𝗠𝗼𝗻𝘁𝗵
🧑‍🤝‍🧑 𝗚𝗲𝗻𝗱𝗲𝗿: 𝗔𝗻𝘆
🏢 𝗙𝗮𝗰𝗶𝗹𝗶𝘁𝗶𝗲𝘀: 𝗕𝘂𝘀, 𝗖𝗮𝗻𝘁𝗲𝗲𝗻, 𝗧𝗵𝗿𝗲𝗲 𝗦𝗵𝗶𝗳𝘁𝘀 🚌🍴

━━━━━━━━━━━━━━━
🚀 𝗔𝗽𝗽𝗹𝘆 𝗡𝗼𝘄 / 𝗖𝗮𝗹𝗹 𝗨𝘀
👉 ${job.contact}

🔎 𝗦𝗲𝗮𝗿𝗰𝗵 𝗕𝗲𝘀𝘁 𝗝𝗼𝗯𝘀 𝗶𝗻 𝗣𝘂𝗻𝗲
👉 www.meechto.com

📲 𝗝𝗼𝗶𝗻 𝗢𝘂𝗿 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗖𝗵𝗮𝗻𝗻𝗲𝗹 𝗳𝗼𝗿 𝗗𝗮𝗶𝗹𝘆 𝗝𝗼𝗯 𝗨𝗽𝗱𝗮𝘁𝗲𝘀
👉 https://whatsapp.com/channel

⚡ 𝗛𝘂𝗿𝗿𝘆 𝗨𝗽! 𝟯𝟬𝟬 𝗩𝗮𝗰𝗮𝗻𝗰𝗶𝗲𝘀 – 𝗔𝗽𝗽𝗹𝘆 𝗧𝗼𝗱𝗮𝘆 ⚡
━━━━━━━━━━━━━━
        `;
        
        document.getElementById('shareContent').textContent = shareContent;
    }
}

// Copy share content to clipboard
function copyShareContent() {
    const shareContent = document.getElementById('shareContent').textContent;
    navigator.clipboard.writeText(shareContent)
        .then(() => {
            showToast('Copied to clipboard!');
        })
        .catch((error) => {
            showToast('Failed to copy: ' + error, true);
        });
}

// Share on WhatsApp
function shareOnWhatsApp() {
    const shareContent = document.getElementById('shareContent').textContent;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareContent)}`;
    window.open(whatsappUrl, '_blank');
}

// Close applications modal
function closeApplicationsModal() {
    document.getElementById('applicationsModal').classList.remove('active');
}

// Close edit job modal
function closeEditJobModal() {
    document.getElementById('editJobModal').classList.remove('active');
}

// Close share job modal
function closeShareJobModal() {
    document.getElementById('shareJobModal').classList.remove('active');
}

// Show toast notification
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    
    if (isError) {
        toast.classList.add('error');
    } else {
        toast.classList.remove('error');
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Page navigation function
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-navigation').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show the requested page
    const pageElement = document.getElementById(`${pageId}-page`);
    if (pageElement) {
        pageElement.style.display = 'block';
        
        // Load content for specific pages
        if (pageId === 'my-jobs') {
            renderMyPostedJobs();
            // Update email display
            if (currentUser) {
                document.getElementById('profile-email-display').textContent = currentUser.email;
            }
        } else if (pageId === 'companies') {
            renderCompanies();
        } else if (pageId === 'dashboard') {
            renderJobListings();
        }
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Close mobile menu if open
    const mainNav = document.getElementById('mainNav');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
}

// Update navigation based on auth state and user type
function updateNavigation() {
    const navList = document.getElementById('navList');
    const headerCtaContainer = document.getElementById('headerCtaContainer');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const jobseekerWelcome = document.getElementById('jobseekerWelcome');
    const welcomeUserName = document.getElementById('welcomeUserName');
    const employerElements = document.querySelectorAll('.employer-only');
    
    if (isLoggedIn && currentUser) {
        // Remove Login/Register links
        const authLinks = navList.querySelectorAll('li:nth-last-child(-n+2)');
        authLinks.forEach(li => li.style.display = 'none');
        
        // Show user menu
        userMenu.style.display = 'flex';
        
        // Update user info
        userName.textContent = currentUser.name;
        userAvatar.textContent = currentUser.name.split(' ').map(n => n[0]).join('');
        
        // Show/hide elements based on user type
        if (currentUser.type === 'employer') {
            // Show employer-specific elements
            employerElements.forEach(el => el.style.display = 'block');
            headerCtaContainer.style.display = 'block';
            if (jobseekerWelcome) jobseekerWelcome.style.display = 'none';
        } else {
            // Hide employer-specific elements
            employerElements.forEach(el => el.style.display = 'none');
            headerCtaContainer.style.display = 'none';
            if (jobseekerWelcome) {
                jobseekerWelcome.style.display = 'block';
                welcomeUserName.textContent = currentUser.name.split(' ')[0];
            }
        }
    } else {
        // Show Login/Register links
        const authLinks = navList.querySelectorAll('li:nth-last-child(-n+2)');
        authLinks.forEach(li => li.style.display = 'list-item');
        
        // Hide user menu and employer elements
        userMenu.style.display = 'none';
        headerCtaContainer.style.display = 'none';
        employerElements.forEach(el => el.style.display = 'none');
        if (jobseekerWelcome) jobseekerWelcome.style.display = 'none';
    }
}

// Open job post modal
function openJobPostModal() {
    if (!isLoggedIn) {
        showPage('login');
        return;
    }
    
    if (currentUser.type !== 'employer') {
        showToast('Only employers can post jobs', true);
        return;
    }
    
    document.getElementById('jobPostModal').classList.add('active');
}

// Close job post modal
function closeJobPostModal() {
    document.getElementById('jobPostModal').classList.remove('active');
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        isLoggedIn = false;
        currentUser = null;
        updateNavigation();
        showPage('dashboard');
        showToast('Logged out successfully');
    }).catch((error) => {
        showToast('Logout error: ' + error.message, true);
    });
}
