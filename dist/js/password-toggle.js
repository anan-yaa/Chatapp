
    document.addEventListener("DOMContentLoaded", function () {
      const toggleBtns = document.querySelectorAll(".password-toggle");
      toggleBtns.forEach((btn) => {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const wrapper = btn.closest('.relative');
          const input = wrapper.querySelector('input[type="password"], input[type="text"]');
          const eyeOpen = btn.querySelector('.eye-open');
          const eyeClosed = btn.querySelector('.eye-closed');
          if (!input) return;
          if (input.type === 'password') {
            input.type = 'text';
            eyeOpen.classList.add('hidden');
            eyeClosed.classList.remove('hidden');
          } else {
            input.type = 'password';
            eyeOpen.classList.remove('hidden');
            eyeClosed.classList.add('hidden');
          }
        });
      });
    });
