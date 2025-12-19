const contactForm = document.getElementById('contactForm');
const feedback = document.getElementById('formFeedback');

if(contactForm) {
  contactForm.addEventListener('submit', function(event) {
    event.preventDefault();

    contactForm.style.display = 'none';
    feedback.classList.remove('hidden');
  })
}