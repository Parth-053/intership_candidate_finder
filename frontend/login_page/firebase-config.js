// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABIavqHgoKOrSMYrF_W6aR5LC5aPhcx9I",
  authDomain: "careerconnect-ba944.firebaseapp.com",
  projectId: "careerconnect-ba944",
  storageBucket: "careerconnect-ba944.firebasestorage.app",
  messagingSenderId: "569922318821",
  appId: "1:569922318821:web:706b6e733c4ea953b3bf0c",
  measurementId: "G-0ZDVCJF47D"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Function to show alert
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${type}`;
  alertDiv.innerHTML = `
    <span>${message}</span>
    <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentElement) {
      alertDiv.remove();
    }
  }, 5000);
}

// Function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate password strength
function isValidPassword(password) {
  return password.length >= 6;
}