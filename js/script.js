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
    loadNews();
    loadGallery();
    loadRecentResults();
    initGalleryModal();
});

function loadNews() {
    const newsGrid = document.getElementById('news-cards');
    if (!newsGrid) {
        return;
    }

    fetch('news.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to load news.json');
            }
            return response.json();
        })
        .then(newsItems => {
            if (!Array.isArray(newsItems) || newsItems.length === 0) {
                newsGrid.innerHTML = '<div class="col-span-full bg-rhinoNavy border border-slate-800 rounded-3xl p-6 text-center text-slate-400">No news available.</div>';
                return;
            }

            const cards = newsItems.slice(0, 4).map(item => {
                const title = item.title || 'Update';
                const date = item.date || '';
                const summary = item.summary || '';
                let link = '';
                if (item.link) {
                    const url = item.link;
                    // detect absolute/external URLs (e.g. https://example.com, //cdn, mailto:, etc.)
                    const isAbsolute = /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:)?\/\//.test(url) || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
                    const attrs = isAbsolute ? ' target="_blank" rel="noopener noreferrer"' : '';
                    link = `<a href="${url}"${attrs} class="mt-6 inline-flex items-center gap-2 text-rhinoRed hover:text-white underline text-sm font-semibold">Read More <i class="fa-solid fa-arrow-right"></i></a>`;
                }

                return `
                    <div class="news-card bg-rhinoNavy/80 p-8 rounded-3xl border border-slate-800 hover:border-rhinoRed transition duration-300 min-w-[280px]">
                        <div class="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-300 font-semibold mb-4">News</div>
                        <h3 class="text-xl font-black uppercase text-white leading-snug">${title}</h3>
                        <p class="text-slate-500 uppercase tracking-[0.2em] text-xs mt-4">${date}</p>
                        <p class="text-slate-300 mt-5 leading-relaxed text-sm">${summary}</p>
                        ${link}
                    </div>
                `;
            }).join('');

            // insert the cards and duplicate them for a seamless marquee
            newsGrid.innerHTML = cards + cards;
            // ensure wrapper has marquee class (in case) and apply track behavior
            newsGrid.classList.add('news-track');
        })
        .catch(error => {
            console.error('Failed to load news:', error);
            newsGrid.innerHTML = '<div class="col-span-full bg-rhinoNavy border border-slate-800 rounded-3xl p-6 text-center text-slate-400">Unable to load news.</div>';
        });
}

function loadGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) {
        return;
    }

    fetch('gallery.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to load gallery.json');
            }
            return response.json();
        })
        .then(imageFiles => {
            if (!Array.isArray(imageFiles)) {
                throw new Error('Invalid gallery manifest');
            }

            const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tif', '.tiff'];
            const images = imageFiles
                .filter(file => typeof file === 'string' && file.trim())
                .filter(file => supportedExtensions.some(ext => file.toLowerCase().endsWith(ext)))
                .map(file => {
                    const src = `images/Gallery/${file}`;
                    const alt = file.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '');
                    return `
                        <div class="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                            <img data-gallery-image="${src}" data-gallery-alt="${alt}" src="${src}" alt="${alt}" class="gallery-preview h-64 w-full cursor-pointer object-cover transition duration-300 hover:scale-105">
                        </div>
                    `;
                });

            galleryGrid.innerHTML = images.join('') || '<div class="col-span-full text-center text-slate-400">No gallery images found.</div>';
            initGalleryModal();
        })
        .catch(error => {
            console.error('Failed to load gallery:', error);
            galleryGrid.innerHTML = '<div class="col-span-full text-center text-slate-400">Unable to load gallery.</div>';
        });
}

function loadRecentResults() {
    const resultsContainer = document.getElementById('recent-results');
    if (!resultsContainer) {
        return;
    }

    fetch('recent-matches.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to load recent-matches.json');
            }
            return response.json();
        })
        .then(results => {
            if (!Array.isArray(results) || results.length === 0) {
                resultsContainer.innerHTML = '<div class="bg-rhinoNavy border border-slate-800 rounded-lg p-6 text-center text-slate-400">No recent results available.</div>';
                return;
            }

            const nextMatchContainer = document.getElementById('next-match');
            const nextMatch = results[0];
            const pastMatches = results.slice(1);

            if (nextMatchContainer) {
                nextMatchContainer.innerHTML = `
                    <div class="overflow-hidden rounded-[2rem] border border-rhinoRed/30 bg-gradient-to-r from-rhinoRed/15 via-slate-950/95 to-rhinoRed/15 p-1 shadow-2xl shadow-rhinoRed/20">
                        <div class="rounded-[1.75rem] bg-slate-950 p-8">
                            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <span class="inline-flex items-center rounded-full bg-rhinoRed/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-rhinoRed">Next Match</span>
                                    <h3 class="mt-4 text-3xl md:text-4xl font-black uppercase text-white leading-tight">${nextMatch.Title || 'Next Match'}</h3>
                                    <p class="mt-3 text-sm uppercase tracking-widest text-slate-400">${nextMatch.Date || ''}</p>
                                    <p class="mt-5 text-slate-200 text-base md:text-lg">${nextMatch.Result || ''}</p>
                                </div>
                                ${nextMatch.ScorecardLink ? `<div class="flex items-center justify-start"><a href="${nextMatch.ScorecardLink}" target="_blank" class="inline-flex items-center gap-2 rounded-full border border-rhinoRed bg-rhinoRed/10 px-6 py-3 text-sm font-semibold text-rhinoRed transition hover:bg-rhinoRed hover:text-white">View Scorecard <i class="fa-solid fa-arrow-up-right-from-square"></i></a></div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }

            if (pastMatches.length > 0) {
                resultsContainer.innerHTML = pastMatches.map(match => {
                    const title = match.Title || 'Match';
                    const date = match.Date || '';
                    const result = match.Result || '';
                    const scorecardLink = match.ScorecardLink ? `<a href="${match.ScorecardLink}" target="_blank" class="inline-flex items-center gap-2 text-rhinoRed hover:text-white underline text-sm font-semibold">View Scorecard <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : '';

                    return `
                        <div class="bg-rhinoNavy border border-slate-800 rounded-3xl p-6">
                            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div>
                                    <h3 class="text-lg font-bold text-white">${title}</h3>
                                    <p class="text-slate-400 text-sm mt-1">${date}</p>
                                    <p class="text-slate-200 mt-4">${result}</p>
                                </div>
                                <div class="flex items-center">${scorecardLink}</div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                resultsContainer.innerHTML = '<div class="bg-rhinoNavy border border-slate-800 rounded-lg p-6 text-center text-slate-400">No past results available yet.</div>';
            }
        })
        .catch(error => {
            console.error('Failed to load recent results:', error);
            resultsContainer.innerHTML = '<div class="bg-rhinoNavy border border-slate-800 rounded-lg p-6 text-center text-slate-400">Unable to load recent results.</div>';
        });
}

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
                <div class="relative overflow-hidden flex items-center justify-center bg-slate-800">
                    <div class="relative w-full max-h-96 overflow-hidden border-2 border-slate-700 rounded-xl bg-slate-950">
                        <img src="${imageSrc}" alt="${player.fullName}" class="h-full w-full object-contain object-center bg-slate-800" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex'">
                        <div class="absolute inset-0 hidden items-center justify-center bg-slate-900/80 text-slate-300 text-center px-4" style="display: none;">
                            <div>
                                <i class="fa-solid fa-user text-4xl mb-3"></i>
                                <p class="text-xs uppercase tracking-wider">Photo coming soon</p>
                            </div>
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
