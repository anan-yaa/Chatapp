document.addEventListener("DOMContentLoaded", function () {
  const toggleBtns = document.querySelectorAll(".password-toggle");
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const wrapper = btn.closest('.relative');
      if (!wrapper) return;
      const input = wrapper.querySelector('input[type="password"], input[type="text"]');
      if (!input) return;
      const icon = btn.querySelector('i');
      if (!icon) return;
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
});
