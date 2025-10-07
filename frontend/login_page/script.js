// ===== Sidebar Active State =====
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".sidebar a");
  const current = window.location.pathname.split("/").pop();
  
  links.forEach(link => {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });
});

// ===== Dashboard Stats Example =====
if (document.querySelector(".cards-container")) {
  const stats = [
    { title: "Active Internships", value: 5, icon: "fa-briefcase" },
    { title: "Total Applications", value: 42, icon: "fa-users" },
    { title: "Shortlisted", value: 12, icon: "fa-check-circle" },
    { title: "Rejected", value: 8, icon: "fa-times-circle" },
  ];

  const container = document.querySelector(".cards-container");
  container.innerHTML = "";
  stats.forEach(stat => {
    container.innerHTML += `
      <div class="card">
        <i class="fa-solid ${stat.icon}"></i>
        <h3>${stat.value}</h3>
        <p>${stat.title}</p>
      </div>
    `;
  });
}

// ===== Manage Internships Actions =====
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const row = e.target.closest("tr");
    if (confirm("Are you sure you want to delete this internship?")) {
      row.remove();
    }
  }

  if (e.target.classList.contains("edit-btn")) {
    alert("Edit internship functionality will go here!");
  }
});

// ===== Applications Shortlist/Reject =====
document.addEventListener("click", (e) => {
  if (e.target.textContent === "Shortlist") {
    e.target.textContent = "Shortlisted";
    e.target.disabled = true;
    e.target.style.background = "#16a34a";
  }
  if (e.target.textContent === "Reject") {
    e.target.textContent = "Rejected";
    e.target.disabled = true;
    e.target.classList.add("reject");
  }
});

// ===== Profile Page Edit =====
if (document.querySelector(".profile-card button")) {
  document.querySelector(".profile-card button").addEventListener("click", () => {
    alert("Profile edit functionality will go here!");
  });
}
// ===== Post Internship Form Validation =====
if (document.querySelector("form")) {
  document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.querySelector("input[name='title']").value;
    const description = document.querySelector("textarea[name='description']").value;

    if (!title || !description) {
      alert("Please fill in all fields.");
      return;
    }

    alert("Internship posted successfully!");
  });
}
// ===== Responsive Sidebar Toggle =====
document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("collapsed");
});
document.querySelector(".content").classList.toggle("expanded");
document.querySelector(".menu-toggle i").classList.toggle("fa-bars");
document.querySelector(".menu-toggle i").classList.toggle("fa-times");
// ===== End of Script =====