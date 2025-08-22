document.addEventListener('DOMContentLoaded', function() {
    let footer = document.querySelector('footer');
    if (!footer) {
        footer = document.createElement('footer');
        footer.className = 'footer';
        document.body.appendChild(footer);
    }
    
    const currentYear = new Date().getFullYear();
    
    const pageName = document.title || 'Website';
    
    footer.innerHTML = `
        <p>&copy; ${currentYear} Werner's Website. All rights reserved.</p>
        <p>You are viewing: ${pageName}</p>
    `;
});
