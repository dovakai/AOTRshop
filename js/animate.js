// fromRight: true = cards slide in from right (homepage), false = from left (shop/accounts)
function animateCards(container, fromRight = false) {
  if (!container) return;
  const cards = Array.from(container.querySelectorAll(
    '.item-card, .account-card, .account-preview-card'
  ));
  if (!cards.length) return;

  const offset = fromRight ? '30px' : '-30px';

  cards.forEach(card => {
    card.style.transition = '';
    card.style.transitionDelay = '';
    card.style.opacity = '0';
    card.style.transform = `translateX(${offset})`;
    card.style.filter = 'blur(4px)';
  });

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => {
        const dy = a.boundingClientRect.top - b.boundingClientRect.top;
        return Math.abs(dy) > 10 ? dy : a.boundingClientRect.left - b.boundingClientRect.left;
      });

    visible.forEach((entry, i) => {
      const el = entry.target;
      const delay = `${i * 120}ms`;
      // delay is baked into the shorthand so it isn't overridden
      el.style.transition = `opacity .5s ${delay} ease, transform .5s ${delay} ease, filter .45s ${delay} ease`;
      el.style.opacity = '1';
      el.style.transform = 'translateX(0)';
      el.style.filter = 'blur(0)';
      observer.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -10px 0px' });

  cards.forEach(card => observer.observe(card));
}
