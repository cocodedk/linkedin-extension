/**
 * Contact information extraction from profile pages
 */

export function extractContactInfoFromProfileDoc(root = document) {
  const sections = Array.from(root.querySelectorAll('.pv-contact-info__contact-type'));
  const contacts = [];
  const links = [];

  sections.forEach((sec) => {
    const header = (sec.querySelector('h3, .pv-contact-info__header')?.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    const anchors = Array.from(sec.querySelectorAll('a[href]'));

    if (anchors.length) {
      anchors.forEach((a) => {
        const href = a.getAttribute('href') || '';
        const label = (a.textContent || href).replace(/\s+/g, ' ').trim();
        if (href) {
          links.push({ href, label, type: header || 'link' });
          contacts.push(`${header || 'link'}: ${href}`);
        }
      });
    } else {
      const txt = (sec.textContent || '').replace(/\s+/g, ' ').trim();
      if (txt) {
        contacts.push(`${header || 'info'}: ${txt}`);
      }
    }
  });

  return { contacts, links };
}

