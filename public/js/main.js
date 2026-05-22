console.log("js loaded");

let offset = 0;
const limit = 10;
let isLoading = false;
let totalPokemon = 0;
let shownCount = 0;

async function loadPokemon() {
    if (isLoading) return;
    if (totalPokemon > 0 && offset >= totalPokemon) {
        document.getElementById("end-message").style.display = "block";
        document.getElementById("load-more-section").style.display = "none";
        return;
    }

    isLoading = true;
    document.getElementById("loading").style.display = "flex";
    document.getElementById("load-more-btn").disabled = true;

    // Step 1: get batch of pokemon names (unchanged from Lab 3)
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    let jsonObj = await response.json();
    totalPokemon = jsonObj.count;

    // Step 2: fetch details in parallel (unchanged from Lab 3)
    const detailPromises = jsonObj.results.map(pokemon =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
            .then(r => r.json())
            .catch(() => null)
    );
    const details = await Promise.all(detailPromises);

    // Step 3: render cards with hover overlay
    const container = document.getElementById("pokemon-container");

    details.forEach(p => {
        if (!p) return;

        const imageUrl = p.sprites.other['official-artwork'].front_default;
        const hp  = p.stats.find(s => s.stat.name === 'hp')?.base_stat ?? 0;
        const atk = p.stats.find(s => s.stat.name === 'attack')?.base_stat ?? 0;
        const def = p.stats.find(s => s.stat.name === 'defense')?.base_stat ?? 0;

        const types = p.types.map(t =>
            `<span class="type-pill type-${t.type.name}">${t.type.name}</span>`
        ).join('');

        // Cap at 255 for bar width
        const hpW  = Math.min(Math.round((hp  / 255) * 100), 100);
        const atkW = Math.min(Math.round((atk / 255) * 100), 100);
        const defW = Math.min(Math.round((def / 255) * 100), 100);

        const card = document.createElement("div");
        card.className = "pokemon-card";
        card.innerHTML = `
            <span class="card-id">#${String(p.id).padStart(3,'0')}</span>
            <div class="card-img-wrap">
                <img src="${imageUrl}" alt="${p.name}" loading="lazy"/>
            </div>
            <div class="card-footer-strip">
                <span class="pokemon-name">${p.name}</span>
            </div>
            <div class="hover-overlay">
                <span class="overlay-poke-name">${p.name}</span>
                <div class="overlay-stat">
                    <span class="stat-label">HP</span>
                    <div class="stat-bar-wrap"><div class="stat-bar" style="--w:${hpW}%"></div></div>
                    <span class="stat-val">${hp}</span>
                </div>
                <div class="overlay-stat">
                    <span class="stat-label">ATK</span>
                    <div class="stat-bar-wrap"><div class="stat-bar" style="--w:${atkW}%"></div></div>
                    <span class="stat-val">${atk}</span>
                </div>
                <div class="overlay-stat">
                    <span class="stat-label">DEF</span>
                    <div class="stat-bar-wrap"><div class="stat-bar" style="--w:${defW}%"></div></div>
                    <span class="stat-val">${def}</span>
                </div>
                <div class="overlay-types">${types}</div>
            </div>
        `;
        container.appendChild(card);
        shownCount++;
    });

    document.getElementById("count-num").textContent = shownCount;
    offset += limit;
    isLoading = false;

    // Artificial delay so the spinner is visible before hiding
    await new Promise(resolve => setTimeout(resolve, 1500));

    document.getElementById("loading").style.display = "none";
    document.getElementById("load-more-btn").disabled = false;

    if (offset >= totalPokemon) {
        document.getElementById("end-message").style.display = "block";
        document.getElementById("load-more-section").style.display = "none";
    }
}

// Load first 10 on page load
loadPokemon();

// Load More button
document.getElementById("load-more-btn").addEventListener("click", loadPokemon);

// ── SCROLL EVENT COMMENTED OUT (replaced by Load More button for Lab 4) ──
// document.addEventListener("scroll", function () {
//     let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
//     let scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
//     let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
//     let scrollbuffer = 5;
//     if (scrollTop + clientHeight + scrollbuffer >= scrollHeight) {
//         loadPokemon();
//     }
// });