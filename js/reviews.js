// Reviews page logic

let selectedRating = 0;

function starsHtml(rating, size = 16) {
  return Array.from({ length: 5 }, (_, i) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${i < rating ? '#c9a84c' : 'none'}" stroke="#c9a84c" stroke-width="1.5">
      <path d="M11.48 3.5a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z"/>
    </svg>`
  ).join('');
}

function renderReview(r) {
  const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const username = r.profiles?.username || r.username || 'Anonymous';
  return `
    <div class="review-card">
      <div class="review-stars">${starsHtml(r.rating, 14)}</div>
      <p class="review-comment">"${r.comment}"</p>
      <div class="review-meta">
        <span class="review-user">${username}</span>
        <span class="review-date">${date}</span>
      </div>
    </div>
  `;
}

async function loadReviews() {
  const { data, error } = await fetchReviews();
  const listEl = document.getElementById('reviews-list');
  const noEl = document.getElementById('no-reviews');
  const avgEl = document.getElementById('avg-rating');
  const avgStarsEl = document.getElementById('avg-stars');
  const totalEl = document.getElementById('total-reviews-label');

  if (error || !data || !data.length) {
    if (listEl) listEl.innerHTML = '';
    if (noEl) noEl.style.display = 'block';
    if (avgEl) avgEl.textContent = '—';
    if (totalEl) totalEl.textContent = '0 reviews';
    return;
  }

  const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
  if (avgEl) avgEl.textContent = avg.toFixed(1);
  if (avgStarsEl) avgStarsEl.innerHTML = starsHtml(Math.round(avg), 18);
  if (totalEl) totalEl.textContent = `${data.length} verified review${data.length !== 1 ? 's' : ''}`;
  if (noEl) noEl.style.display = 'none';
  if (listEl) listEl.innerHTML = data.map(renderReview).join('');
}

async function checkEligibility(userId) {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') return false;

  // Check if user has a completed order
  const { data } = await db.from('orders')
    .select('id')
    .eq('user_id', userId)
    .eq('delivery_status', 'completed')
    .limit(1);

  return data && data.length > 0;
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadReviews();

  await new Promise(resolve => setTimeout(resolve, 400));

  if (Auth.currentUser) {
    const eligible = await checkEligibility(Auth.currentUser.id);
    if (eligible) {
      const wrap = document.getElementById('review-form-wrap');
      if (wrap) wrap.style.display = 'block';
    }
  }

  // Star selector
  const stars = document.querySelectorAll('.star-sel-btn');
  stars.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.star);
      stars.forEach((s, i) => s.classList.toggle('active', i < selectedRating));
    });
    btn.addEventListener('mouseenter', () => {
      const hover = parseInt(btn.dataset.star);
      stars.forEach((s, i) => s.classList.toggle('active', i < hover));
    });
    btn.addEventListener('mouseleave', () => {
      stars.forEach((s, i) => s.classList.toggle('active', i < selectedRating));
    });
  });

  // Submit review
  document.getElementById('submit-review-btn')?.addEventListener('click', async () => {
    const comment = document.getElementById('review-comment')?.value.trim();
    const errEl = document.getElementById('review-error');

    if (!selectedRating) { errEl.textContent = 'Please select a star rating.'; errEl.classList.add('show'); return; }
    if (!comment) { errEl.textContent = 'Please write a comment.'; errEl.classList.add('show'); return; }
    errEl.classList.remove('show');

    if (SUPABASE_URL === 'YOUR_SUPABASE_URL') { showToast('Connect Supabase to submit reviews.', 'error'); return; }

    const { error } = await db.from('reviews').insert({
      user_id: Auth.currentUser.id,
      rating: selectedRating,
      comment
    });

    if (error) { showToast(error.message || 'Failed to submit review.', 'error'); return; }

    showToast('Review submitted. Thank you!', 'success');
    document.getElementById('review-comment').value = '';
    selectedRating = 0;
    stars.forEach(s => s.classList.remove('active'));
    await loadReviews();
  });
});
