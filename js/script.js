// Delaware Rhinos Website Script
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    loadPlayers();
    initGalleryModal();
});

function loadPlayers() {
    const previewContainer = document.getElementById('squad-preview');
    const rosterContainer = document.getElementById('team-roster');

    if (!previewContainer && !rosterContainer) {
        return;
    }

    const renderFromData = players => {
        const sortedPlayers = players.slice().sort((a, b) => {
            if (a.captain && !b.captain) return -1;
            if (!a.captain && b.captain) return 1;
            return a.fullName.localeCompare(b.fullName);
        });

        if (previewContainer) {
            renderPlayers(previewContainer, sortedPlayers.slice(0, 4));
        }
        if (rosterContainer) {
            renderPlayers(rosterContainer, sortedPlayers);
        }
    };

    if (window.RHINOS_PLAYERS && Array.isArray(window.RHINOS_PLAYERS)) {
        renderFromData(window.RHINOS_PLAYERS);
        return;
    }

    fetch('players.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to load players.json');
            }
            return response.json();
        })
        .then(renderFromData)
        .catch(error => {
            console.error('Failed to load players:', error);
            if (previewContainer) {
                previewContainer.innerHTML = '<div class="col-span-full text-center text-slate-400">Roster unavailable.</div>';
            }
            if (rosterContainer) {
                rosterContainer.innerHTML = '<div class="col-span-full text-center text-slate-400">Roster unavailable.</div>';
            }
        });
}

function renderPlayers(container, players) {
    const cards = players.map(player => {
        const jerseyText = player.jersey ? ` • Jersey #${player.jersey}` : '';
        const badgeText = player.captain ? 'Captain' : player.role;
        const imageSrc = player.image || 'images/logo.png';
        return `
            <div class="bg-rhinoNavy border border-slate-800 rounded-xl overflow-hidden group hover:border-rhinoRed transition">
                <div class="h-72 bg-slate-800 relative overflow-hidden flex items-center justify-center">
                    <img src="${imageSrc}" alt="${player.fullName}" class="h-full w-full object-cover object-center" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div class="absolute inset-0 hidden items-center justify-center bg-slate-900/80 text-slate-300 text-center px-4" style="display: none;">
                        <div>
                            <i class="fa-solid fa-user text-4xl mb-3"></i>
                            <p class="text-xs uppercase tracking-wider">Photo coming soon</p>
                        </div>
                    </div>
                    <div class="absolute inset-0 bg-black/25"></div>
                    <div class="absolute top-4 left-4 bg-slate-950/80 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded">${badgeText}</div>
                    ${player.jersey ? `<div class="absolute top-4 right-4 bg-rhinoRed text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded">#${player.jersey}</div>` : ''}
                </div>
                <div class="p-6">
                    <h3 class="text-2xl font-black text-white uppercase">${player.fullName}</h3>
                    <p class="text-rhinoBlue font-extrabold text-xs uppercase tracking-wider mb-3">${player.role}${jerseyText}</p>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = cards || '<div class="col-span-full text-center text-slate-400">No players available.</div>';
}

function initGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    const modalImage = document.getElementById('gallery-modal-image');
    const modalCaption = document.getElementById('gallery-modal-caption');
    const modalClose = document.getElementById('gallery-modal-close');

    if (!modal || !modalImage || !modalCaption || !modalClose) {
        return;
    }

    document.querySelectorAll('.gallery-preview').forEach(image => {
        image.addEventListener('click', () => {
            const src = image.dataset.galleryImage || image.src;
            const alt = image.dataset.galleryAlt || image.alt || 'Gallery Image';
            modalImage.src = src;
            modalCaption.textContent = alt;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        });
    });

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeModal();
        }
    });
}
