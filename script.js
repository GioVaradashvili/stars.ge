const sky = document.getElementById('sky');
const detailPanel = document.getElementById('star-detail-panel');
const starsData = [];
let activeStarEl = null;

// ვარსკვლავების ბაზა (ლოკალური)
let occupiedStars = {
    "GEO881": { owner: "ლიზი მოჩიტიძე", starName: "DADU" }
};

function init() {
    // ქმნის 6 გალაქტიკურ კლასტერს
    const clusters = [];
    for(let c = 0; c < 6; c++) {
        clusters.push({ x: Math.random() * 4500 + 750, y: Math.random() * 4500 + 750 });
    }

    // 3000 ვარსკვლავის გენერაცია
    for (let i = 0; i < 3000; i++) {
        createStar("GEO" + (100 + i), clusters);
    }
}

function createStar(id, clusters) {
    let h = 0;
    for(let i=0; i<id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
    const cluster = clusters[Math.abs(h % clusters.length)];
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.pow(Math.random(), 2) * 1500; 
    
    const s = {
        id: id.toUpperCase(),
        x: cluster.x + Math.cos(angle) * radius,
        y: cluster.y + Math.sin(angle) * radius,
        size: Math.random() * 2.2 + 0.8,
        color: ['#ffffff', '#ffcc00', '#aaddff', '#ff8800'][Math.abs(h % 4)]
    };

    const el = document.createElement('div');
    el.className = 'star';
    el.id = "star-" + s.id;
    el.style.left = s.x + 'px'; el.style.top = s.y + 'px';
    el.style.width = el.style.height = s.size + 'px';
    el.style.backgroundColor = s.color;
    el.style.boxShadow = `0 0 ${s.size}px ${s.color}`;
    el.style.setProperty('--dur', (Math.random() * 3 + 2) + 's');
    
    el.onclick = (e) => { e.stopPropagation(); selectStar(el, s); };
    sky.appendChild(el);
    starsData.push(s);
}

function selectStar(el, data) {
    if (activeStarEl) activeStarEl.classList.remove('active');
    el.classList.add('active');
    activeStarEl = el;

    const info = occupiedStars[data.id];
    document.getElementById('p-id').innerText = data.id;
    const badge = document.getElementById('status-badge');
    const buyBtn = document.getElementById('buy-btn');
    
    if (info) {
        badge.innerText = "OCCUPIED"; badge.className = "badge taken";
        document.getElementById('p-name').innerText = info.starName;
        document.getElementById('p-owner').innerText = info.owner;
        buyBtn.classList.add('hidden');
    } else {
        badge.innerText = "AVAILABLE"; badge.className = "badge available";
        document.getElementById('p-name').innerText = "არ აქვს";
        document.getElementById('p-owner').innerText = "თავისუფალია";
        buyBtn.classList.remove('hidden');
    }
    detailPanel.classList.remove('hidden');
}

// ნებისმიერი ტექსტის ძებნა (Hash-ზე დაფუძნებული Random)
document.getElementById('search-bar').onkeypress = (e) => {
    if(e.key === 'Enter') {
        let val = e.target.value.trim().toUpperCase();
        if(!val) return;

        let s = starsData.find(x => x.id === val);
        if(!s) {
            let hash = 0;
            for (let i = 0; i < val.length; i++) hash = val.charCodeAt(i) + ((hash << 5) - hash);
            s = starsData[Math.abs(hash % starsData.length)];
        }

        if(s) {
            let cx = (window.innerWidth / 2) - s.x;
            let cy = (window.innerHeight / 2) - s.y;
            sky.style.transition = "transform 1.2s cubic-bezier(0.39, 0.57, 0.56, 1)";
            sky.style.transform = `translate(${cx}px, ${cy}px) scale(1.5)`;
            setTimeout(() => selectStar(document.getElementById("star-" + s.id), s), 1200);
        }
    }
};

function handleFormSubmit(event) {
    event.preventDefault();
    const starId = document.getElementById('p-id').innerText;
    const ownerName = document.getElementById('form-owner-name').value;
    const starName = document.getElementById('form-star-name').value;

    // ინახავს მხოლოდ ამ სესიაზე
    occupiedStars[starId] = { owner: ownerName, starName: starName };
    alert("ვარსკვლავი " + starId + " წარმატებით დაიკავა: " + ownerName);
    hideUI();
}

function hideUI() {
    detailPanel.classList.add('hidden');
    document.getElementById('modal-backdrop').classList.add('hidden');
    if (activeStarEl) activeStarEl.classList.remove('active');
}

function openOrderModal() {
    document.getElementById('modal-backdrop').classList.remove('hidden');
}

// კამერის მართვა
let isDrag = false, sx, sy, cx = -2000, cy = -2000;
sky.style.transform = `translate(${cx}px, ${cy}px)`;

document.addEventListener('mousedown', e => { 
    if(e.target.id !== 'search-bar' && !e.target.closest('.modal')) {
        isDrag = true; sx = e.clientX - cx; sy = e.clientY - cy; sky.style.transition = "none";
    }
});
document.addEventListener('mousemove', e => { if(isDrag) { cx = e.clientX - sx; cy = e.clientY - sy; sky.style.transform = `translate(${cx}px, ${cy}px)`; } });
document.addEventListener('mouseup', () => isDrag = false);

init();