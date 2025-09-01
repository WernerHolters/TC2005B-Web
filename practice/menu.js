document.addEventListener('DOMContentLoaded', function() {
    const menuItems = [
        { text: 'Home', href: 'home.html' },
        { text: 'About', href: 'about.html' },
        { text: 'Services', href: 'services.html' },
        { text: 'Contact', href: 'contact.html' }
    ];

    const menuUl = document.querySelector('.menu ul');
    
    if (menuUl) {
        menuUl.innerHTML = '';
        
        menuItems.forEach(function(item) {
            const li = document.createElement('li');
            
            const a = document.createElement('a');
            a.href = item.href;
            a.textContent = item.text;
            
            if (window.location.href.includes(item.href)) {
                a.classList.add('active');
            }
            
            li.appendChild(a);
            
            menuUl.appendChild(li);
        });
    }
});
