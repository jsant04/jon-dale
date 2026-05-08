let selectedGuest = null;
let allGuests     = [];   // cached after first load

// ── Sticky nav ──
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Scroll reveal ──
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ── Load all guests from Supabase once ──
async function loadGuests() {
  const { data, error } = await db
    .from('guests')
    .select('id, name, seats, status')
    .order('name');

  if (error) {
    console.error('Could not load guest list:', error.message);
    return;
  }
  allGuests = data;
}
loadGuests();

// ── RSVP search ──
const searchInput = document.getElementById('guestSearch');
const sugBox      = document.getElementById('suggestions');
const notFound    = document.getElementById('notFound');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  notFound.style.display = 'none';

  if (q.length < 2) {
    sugBox.style.display = 'none';
    return;
  }

  const matches = allGuests.filter(g => g.name.toLowerCase().includes(q));

  if (!matches.length) {
    sugBox.style.display = 'none';
    notFound.style.display = 'block';
    return;
  }

  sugBox.innerHTML = matches.slice(0, 8).map(g => `
    <div class="suggestion-item" data-id="${g.id}">
      <span class="sug-name">${g.name}</span>
      <span class="sug-seats">${g.seats} seat${g.seats > 1 ? 's' : ''}</span>
    </div>
  `).join('');
  sugBox.style.display = 'block';
});

sugBox.addEventListener('click', e => {
  const item = e.target.closest('.suggestion-item');
  if (!item) return;

  const id = parseInt(item.dataset.id, 10);
  selectedGuest = allGuests.find(g => g.id === id);
  sugBox.style.display = 'none';
  searchInput.value = '';

  showStep('step-confirm');
  document.getElementById('displayName').textContent = selectedGuest.name;
  document.getElementById('displaySeats').textContent =
    `${selectedGuest.seats} seat${selectedGuest.seats > 1 ? 's' : ''} reserved`;
});

document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrapper')) sugBox.style.display = 'none';
});

// ── RSVP buttons ──
document.getElementById('btnAttend').addEventListener('click',  () => submitRSVP('attending'));
document.getElementById('btnDecline').addEventListener('click', () => submitRSVP('not_attending'));

async function submitRSVP(status) {
  if (!selectedGuest) return;

  // Write the response back to Supabase
  const { error } = await db
    .from('guests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', selectedGuest.id);

  if (error) {
    console.error('Could not save RSVP:', error.message);
    // Still show confirmation to the guest — don't leave them hanging
  }

  // Update local cache so re-searches reflect the change
  const cached = allGuests.find(g => g.id === selectedGuest.id);
  if (cached) cached.status = status;

  const attending = status === 'attending';

  document.getElementById('confirmIcon').textContent    = attending ? '🥂' : '💌';
  document.getElementById('confirmHeading').textContent = attending ? "We'll see you there!" : "We'll miss you dearly";
  document.getElementById('confirmName').textContent    = selectedGuest.name;
  document.getElementById('confirmText').innerHTML      = attending
    ? `Thank you, <span class="confirm-name-em">${selectedGuest.name}</span>.<br>Your RSVP has been received with joy. We can't wait to celebrate with you!`
    : `Thank you, <span class="confirm-name-em">${selectedGuest.name}</span>.<br>We're sorry you won't be able to join us, but we'll carry you in our hearts on our special day.`;

  showStep('step-done');
}

document.getElementById('backBtn').addEventListener('click',  () => { selectedGuest = null; showStep('step-search'); });
document.getElementById('resetBtn').addEventListener('click', () => { selectedGuest = null; showStep('step-search'); });

function showStep(id) {
  document.querySelectorAll('.rsvp-step').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Background music ──
const bgMusic = document.getElementById('bgMusic');
bgMusic.volume = 0.35;

// Browsers block autoplay until the user interacts with the page.
// We attempt to play immediately; if blocked, we retry on the first
// interaction (click, keydown, or scroll).
bgMusic.play().catch(() => {
  const startMusic = () => {
    bgMusic.play();
    window.removeEventListener('click',   startMusic);
    window.removeEventListener('keydown', startMusic);
    window.removeEventListener('scroll',  startMusic);
  };
  window.addEventListener('click',   startMusic, { once: true });
  window.addEventListener('keydown', startMusic, { once: true });
  window.addEventListener('scroll',  startMusic, { once: true });
});
