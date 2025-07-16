class AuthService {
  constructor() {
    this.baseURL = "/api";
    this.token = localStorage.getItem("token");
    this.user = JSON.parse(localStorage.getItem("user") || "null");
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      this.token = data.token;
      this.user = data.user;

      localStorage.setItem("token", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));

      return data;
    } catch (error) {
      throw error;
    }
  }

  async register(email, password, username) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      this.token = data.token;
      this.user = data.user;

      localStorage.setItem("token", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));

      return data;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }
}

// Global auth service instance
window.authService = new AuthService();

// Login form handler
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const submitBtn = document.querySelector('button[type="submit"]');
    const errorDiv =
      document.getElementById("error-message") || createErrorDiv();

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing In...";
      hideError();

      await authService.login(email, password);
      window.location.href = "/";
    } catch (error) {
      showError(error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  });
}

// Signup form handler
if (document.getElementById("signupForm")) {
  document
    .getElementById("signupForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const submitBtn = document.querySelector('button[type="submit"]');
      const errorDiv =
        document.getElementById("error-message") || createErrorDiv();

      if (password !== confirmPassword) {
        showError("Passwords do not match");
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating Account...";
        hideError();

        await authService.register(email, password, username);
        window.location.href = "/";
      } catch (error) {
        showError(error.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign Up";
      }
    });
}

function createErrorDiv() {
  const errorDiv = document.createElement("div");
  errorDiv.id = "error-message";
  errorDiv.className = "text-red-500 text-sm mt-2 text-center";
  const form = document.querySelector("form");
  form.insertBefore(errorDiv, form.firstChild);
  return errorDiv;
}

function showError(message) {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }
}

function hideError() {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) {
    errorDiv.style.display = "none";
  }
}

// Check authentication on page load
document.addEventListener("DOMContentLoaded", () => {
  // If user is authenticated and on login/signup page, redirect to chat
  if (
    authService.isAuthenticated() &&
    (window.location.pathname === "/login" ||
      window.location.pathname === "/signup")
  ) {
    window.location.href = "/";
  }

  // If user is not authenticated and on chat page, redirect to login
  if (!authService.isAuthenticated() && window.location.pathname === "/") {
    window.location.href = "/login";
  }
});
