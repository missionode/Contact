document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const contactList = document.getElementById('contactList');
    const addContactForm = document.getElementById('addContactForm');
    const newNameInput = document.getElementById('newName');
    const newPhoneInput = document.getElementById('newPhone');
    const downloadBackupButton = document.getElementById('downloadBackup');
    const restoreBackupInput = document.getElementById('restoreBackup');
    const restoreBackupButton = document.getElementById('restoreBackupButton');
    const installButton = document.getElementById('installButton');

    let deferredInstallPrompt = null;

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('beforeinstallprompt fired');
        // Prevent the browser's default install prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredInstallPrompt = e;
        // Update UI notify the user they can install the PWA
        installButton.style.display = 'block';
    });

    // Handle the install button click
    installButton.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
            // Show the install prompt
            deferredInstallPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredInstallPrompt.userChoice;
            // Optionally, send analytics event with outcome of user choice
            console.log(`User response to the install prompt: ${outcome}`);
            // We've used the prompt, and it can't be used again, clear it
            deferredInstallPrompt = null;
            // Hide the install button
            installButton.style.display = 'none';
        }
    });

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        // Hide the install button
        installButton.style.display = 'none';
        // Clear the deferredInstallPrompt (it won't be needed anymore)
        deferredInstallPrompt = null;
    });

    // Load contacts from local storage or use initial data
    let contacts = JSON.parse(localStorage.getItem('contacts')) || [
        { name: 'App Support ( Syam )', phone: '7510726715' }
        // Add more initial contacts here if needed
    ];

    function saveContacts() {
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }

    function displayContacts(contactArray) {
        contactList.innerHTML = '';
        contactArray.forEach(contact => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="contact-info">
                    <h3>${contact.name}</h3>
                    <p>${contact.phone}</p>
                </div>
                <a href="tel:${contact.phone}" class="call-button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
<path d="M19.95 21C17.8667 21 15.8083 20.546 13.775 19.638C11.7417 18.73 9.89167 17.4423 8.225 15.775C6.55833 14.1077 5.271 12.2577 4.363 10.225C3.455 8.19233 3.00067 6.134 3 4.05C3 3.75 3.1 3.5 3.3 3.3C3.5 3.1 3.75 3 4.05 3H8.1C8.33333 3 8.54167 3.07933 8.725 3.238C8.90833 3.39667 9.01667 3.584 9.05 3.8L9.7 7.3C9.73333 7.56667 9.725 7.79167 9.675 7.975C9.625 8.15833 9.53333 8.31667 9.4 8.45L6.975 10.9C7.30833 11.5167 7.704 12.1123 8.162 12.687C8.62 13.2617 9.12433 13.816 9.675 14.35C10.1917 14.8667 10.7333 15.346 11.3 15.788C11.8667 16.23 12.4667 16.634 13.1 17L15.45 14.65C15.6 14.5 15.796 14.3877 16.038 14.313C16.28 14.2383 16.5173 14.2173 16.75 14.25L20.2 14.95C20.4333 15.0167 20.625 15.1377 20.775 15.313C20.925 15.4883 21 15.684 21 15.9V19.95C21 20.25 20.9 20.5 20.7 20.7C20.5 20.9 20.25 21 19.95 21Z" fill="black"/>
</svg></a>
            `;
            contactList.appendChild(listItem);
        });
    }

    function filterContacts(searchTerm) {
        const filteredContacts = contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.phone.includes(searchTerm)
        );
        displayContacts(filteredContacts);
    }

    addContactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newName = newNameInput.value.trim();
        const newPhone = newPhoneInput.value.trim();
        if (newName && newPhone) {
            contacts.push({ name: newName, phone: newPhone });
            saveContacts();
            displayContacts(contacts);
            newNameInput.value = '';
            newPhoneInput.value = '';
        } else {
            alert('Please enter both name and phone number.');
        }
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim();
        filterContacts(searchTerm);
    });

    downloadBackupButton.addEventListener('click', () => {
        const jsonData = JSON.stringify(contacts);
        const filename = 'contacts_backup.json';
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Backup downloaded successfully!');
    });

    restoreBackupButton.addEventListener('click', () => {
        restoreBackupInput.click(); // Trigger file input click
    });

    restoreBackupInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backupContacts = JSON.parse(e.target.result);
                    if (Array.isArray(backupContacts)) {
                        contacts = backupContacts;
                        saveContacts();
                        displayContacts(contacts);
                        alert('Backup restored successfully!');
                    } else {
                        alert('Invalid backup file format.');
                    }
                } catch (error) {
                    alert('Error reading backup file.');
                }
            };
            reader.readAsText(file);
            restoreBackupInput.value = ''; // Reset the file input
        }
    });

    // Initial display of contacts
    displayContacts(contacts);
});