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

// Utility function to create/show/hide error divs scoped inside a form container
function getOrCreateErrorDiv(form) {
  // Try to find existing error message div by id "error-message"
  let errorDiv = form.querySelector("#error-message");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.id = "error-message";
    errorDiv.className = "text-red-500 text-sm mt-2 text-center";
    form.insertBefore(errorDiv, form.firstChild);
  }
  return errorDiv;
}

function showError(message, form) {
  const errorDiv = getOrCreateErrorDiv(form);
  errorDiv.textContent = message;
  errorDiv.classList.remove("hidden");
}

function hideError(form) {
  const errorDiv = form.querySelector("#error-message");
  if (errorDiv) errorDiv.classList.add("hidden");
}

// Login form handler
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    hideError(loginForm);

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing In...";

      await authService.login(email, password);

      // Redirect on successful login
      window.location.href = "/";
    } catch (error) {
      showError(error.message, loginForm);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  });
}

// Signup form handler
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = signupForm.email.value.trim();
    const username = signupForm.username.value.trim();
    const password = signupForm.password.value.trim();
    const confirmPassword = signupForm.confirmPassword.value.trim();
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    hideError(signupForm);

    if (password !== confirmPassword) {
      showError("Passwords do not match", signupForm);
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating Account...";

      await authService.register(email, password, username);

      // Redirect on successful signup
      window.location.href = "/";
    } catch (error) {
      showError(error.message, signupForm);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
    }
  });
}

// On page load: redirect based on auth status & page
document.addEventListener("DOMContentLoaded", () => {
  const pathname = window.location.pathname;

  if (
    authService.isAuthenticated() &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    window.location.href = "/";
  }

  if (
    !authService.isAuthenticated() &&
    (pathname === "/" || pathname === "/chat")
  ) {
    window.location.href = "/login";
  }
});
