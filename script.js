const contactForm = document.getElementById('contactForm');
const feedback = document.getElementById('formFeedback');

if(contactForm) {
  contactForm.addEventListener('submit', function(event) {
    event.preventDefault();

    contactForm.style.display = 'none';
    feedback.classList.remove('hidden');
  })
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

window.onload = loadHeader;
