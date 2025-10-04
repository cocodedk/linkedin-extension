/**
 * Virk data display builder
 */

export function createVirkData(lead) {
  const virkData = document.createElement('div');
  virkData.className = 'lead-detail virk-data';
  
  if (lead.virkEnriched && lead.virkCvrNumber) {
    const info = [
      `🏢 CVR: ${lead.virkCvrNumber}`,
      lead.virkAddress && `📍 ${lead.virkAddress}`,
      lead.virkPostalCode && lead.virkCity && `${lead.virkPostalCode} ${lead.virkCity}`,
      lead.virkCompanyForm && `📋 ${lead.virkCompanyForm}`,
      lead.virkStatus && `✅ ${lead.virkStatus}`
    ].filter(Boolean).join(' • ');
    
    virkData.textContent = info;
  }
  
  return virkData;
}
