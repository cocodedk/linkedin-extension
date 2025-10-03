/**
 * Lead card DOM builders
 */

export function createLeadHeader(lead) {
  const header = document.createElement('div');
  header.className = 'lead-header';
  const title = document.createElement('h2');
  title.className = 'lead-name';
  const nameText = lead.name || 'Unknown';
  if (lead.profileUrl) {
    const a = document.createElement('a');
    a.href = lead.profileUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = nameText;
    title.appendChild(a);
  } else {
    title.textContent = nameText;
  }
  const meta = document.createElement('div');
  meta.className = 'lead-meta';
  meta.innerHTML = [
    lead.company ? `<span class="chip">${lead.company}</span>` : '',
    lead.location ? `<span class="chip">${lead.location}</span>` : '',
    lead.aiScore ? `<span class="chip score">Score: ${lead.aiScore}</span>` : ''
  ].filter(Boolean).join(' ');
  header.appendChild(title);
  header.appendChild(meta);
  return header;
}

export function createLeadHeadline(lead) {
  const headline = document.createElement('p');
  headline.className = 'lead-headline';
  headline.textContent = lead.headline || '';
  return headline;
}

export function createLeadContact(lead) {
  const contact = document.createElement('p');
  contact.className = 'lead-contact';
  const links = Array.isArray(lead.contactLinks) ? lead.contactLinks : [];
  if (links.length) {
    contact.textContent = 'Kontakt: ';
    const wrap = document.createElement('span');
    wrap.className = 'contact-links';
    links.forEach((lnk) => {
      const a = document.createElement('a');
      a.href = lnk.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'chip';
      a.textContent = lnk.label || lnk.type || 'link';
      wrap.appendChild(a);
    });
    contact.appendChild(wrap);
  } else if (lead.contact) {
    const a = document.createElement('a');
    a.href = lead.contact;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = 'Kontakt';
    contact.append('Kontakt: ', a);
  }
  return contact;
}

export function createLeadReasons(lead) {
  const reasons = document.createElement('div');
  reasons.className = 'lead-detail';
  if (lead.aiReasons) {
    const label = document.createElement('div');
    label.className = 'lead-detail__label';
    label.textContent = 'AI Reasons';
    const body = document.createElement('div');
    body.className = 'lead-detail__body';
    body.textContent = lead.aiReasons;
    reasons.append(label, body);
  }
  return reasons;
}

export function createLeadSummary(lead) {
  const summary = document.createElement('div');
  summary.className = 'lead-detail';
  if (lead.aiFitSummary) {
    const label = document.createElement('div');
    label.className = 'lead-detail__label';
    label.textContent = 'FITS Summary';
    const body = document.createElement('div');
    body.className = 'lead-detail__body';
    body.textContent = lead.aiFitSummary;
    summary.append(label, body);
  }
  return summary;
}

