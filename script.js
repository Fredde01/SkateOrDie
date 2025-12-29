function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');

  if(contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const btn = contactForm.querySelector('.submit-btn');
      btn.textContent = 'Skickar...';

      const serviceID = 'service_adhpula';
      const templateID = 'template_cfr004h';
      const publicKey = 'CA0PLqzCq8Q01nW_X';

      emailjs.sendForm(serviceID, templateID, this, publicKey)
        .then(() => {
          contactForm.style.display = 'none';
          feedback.classList.remove('hidden');
        }, (error) => {
          alert('Det gick inte att skicka: ' + JSON.stringify(error));
          btn.textContent = 'Submit';
        });
    });
  }
}




function loadHeader() {
    fetch('templates/fragments/header.html') 
        .then(response => {
            if (!response.ok) throw new Error("Kunde inte ladda headern");
            return response.text();
        })
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Fel:', error));
}

window.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  initContactForm();
});
