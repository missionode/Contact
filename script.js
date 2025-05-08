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
        { name: 'Police (Kerala)', phone: '100' },
        { name: 'Fire Force (Kerala)', phone: '112' },
        { name: 'Ambulance (Kerala)', phone: '108' },
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
                <a href="tel:${contact.phone}" class="call-button">Call</a>
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