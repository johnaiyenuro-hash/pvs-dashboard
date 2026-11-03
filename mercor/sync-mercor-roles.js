/**
 * Mercor Automated Role Ingestion Engine
 * Pulls real-time live opportunities directly from Mercor AWS API,
 * filters against CAD / AEC / BIM / CDE criteria, and generates live-roles.json + live-roles.js.
 */

const fs = require('fs');
const path = require('path');

const MERCOR_ENDPOINT = 'https://aws.api.mercor.com/work/listings-explore-page';
const OUTPUT_JSON = path.join(__dirname, 'live-roles.json');
const OUTPUT_JS = path.join(__dirname, 'live-roles.js');

// Technical domain anchors
const ANCHOR_PATTERNS = [
  { name: 'AutoCAD', regex: /\b(autocad|cad\b|drafting|drafter|draftsperson)\b/i, tier: 1 },
  { name: 'Revit / BIM', regex: /\b(revit|bim\b|navisworks|clash detection)\b/i, tier: 1 },
  { name: 'Civil / Structural', regex: /\b(civil|structural|survey engineer|land survey|site civil|stress engineering)\b/i, tier: 1 },
  { name: 'Mechanical CAD', regex: /\b(mechanical|solidworks|catia|nx\b|creo|inventor|3d modeling)\b/i, tier: 1 },
  { name: 'Architecture / AEC', regex: /\b(architectural|architect\b|aec\b|as-built|point cloud|laser scan|tender pack)\b/i, tier: 1 },
  { name: 'CDE / ISO 19650', regex: /\b(cde\b|common data environment|glider|gliderbim|iso 19650|cobie|aim\b|ifc\b|aconex)\b/i, tier: 2 }
];

// Domains strictly excluded
const EXCLUSION_PATTERNS = [
  /\b(copywriting|copywriter|blog post|creative writing|transcription|virtual assistant|social media|customer service|customer support)\b/i,
  /\b(legal expert|patent attorney|lawyer|paralegal|physician|radiologist|cardiologist|medical|clinical survey|medicare|nursing|pharmacy|orthodontist|biologist|chemist)\b/i
];

async function syncMercorRoles() {
  console.log('[Mercor Sync] Connecting to Mercor AWS API...');
  const res = await fetch(MERCOR_ENDPOINT, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://work.mercor.com',
      'Referer': 'https://work.mercor.com/explore'
    }
  });

  if (!res.ok) {
    throw new Error(`Mercor API responded with status ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const rawListings = data.listings || [];
  console.log(`[Mercor Sync] Retrieved ${rawListings.length} total active listings from Mercor.`);

  const filteredRoles = [];

  for (const item of rawListings) {
    const title = item.title || '';
    const desc = item.description || '';
    const combined = `${title}\n${desc}`;

    // Disqualification check
    const isExcluded = EXCLUSION_PATTERNS.some(re => re.test(combined));
    if (isExcluded) continue;

    const rateMin = item.rateMin || 0;
    const rateMax = item.rateMax || rateMin;
    if (rateMax < 40) continue; // Minimum rate floor

    // Detect technical anchors
    const detectedAnchors = [];
    ANCHOR_PATTERNS.forEach(anchor => {
      if (anchor.regex.test(combined)) {
        detectedAnchors.push(anchor);
      }
    });

    // Check title or body relevance
    const titleKeywords = /\b(cad|drafting|bim|revit|architect|architectural|civil|mechanical|structural|engineering|solidworks|autocad|cde|survey)\b/i;
    const titleIsTarget = titleKeywords.test(title);

    if (detectedAnchors.length > 0 && titleIsTarget) {
      const hasTier2 = detectedAnchors.some(a => a.tier === 2);
      let verdict = 'TIER 1: CAD / AEC TARGET';
      let score = 88;

      if (hasTier2) {
        verdict = 'EXPANSION: CDE / ISO 19650';
        score = 98;
      } else if (rateMax >= 90) {
        verdict = 'HIGH-LEVERAGE TARGET ($90+)';
        score = 95;
      } else if (rateMax >= 65) {
        verdict = 'TIER 1: PRIMARY MATCH';
        score = 90;
      } else {
        verdict = 'SUB-$65/HR BENCHMARK';
        score = 72;
      }

      // Generate pitch tailored to role
      let pitch = '';
      if (hasTier2) {
        pitch = `Specialized CAD/CDE practitioner with hands-on experience in ISO 19650 information management, GliderBIM workflows, and drawing package delivery. Available immediately.`;
      } else if (/mechanical|solidworks|inventor/i.test(title)) {
        pitch = `Experienced Mechanical & CAD specialist with strong proficiency in 3D modeling, drawing standards, and technical design verification. Immediate availability for high-precision delivery.`;
      } else {
        pitch = `Senior CAD & technical drafting specialist with extensive experience in AutoCAD production, WCS coordinates, 3D laser point clouds, and drawing deliverable quality control. Zero rework guarantee.`;
      }

      filteredRoles.push({
        id: item.listingId,
        uid: item.uid,
        title: item.title,
        rateMin,
        rateMax,
        rateFormatted: rateMin === rateMax ? `$${rateMin}/hr` : `$${rateMin}–$${rateMax}/hr`,
        payRateFrequency: item.payRateFrequency || 'hourly',
        commitment: item.commitment || 'contract',
        location: item.location || 'Remote',
        postedAt: item.postedAt || item.createdAt,
        directUrl: `https://work.mercor.com/explore?listingId=${item.listingId}`,
        anchors: detectedAnchors.map(a => a.name),
        verdict,
        score,
        pitch,
        hoursPerWeek: item.hoursPerWeek,
        remainingSlots: item.remainingSlots
      });
    }
  }

  // Sort by score descending, then by rate descending, then by posted date
  filteredRoles.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.rateMax !== a.rateMax) return b.rateMax - a.rateMax;
    return new Date(b.postedAt) - new Date(a.postedAt);
  });

  const outputPayload = {
    syncedAt: new Date().toISOString(),
    totalScanned: rawListings.length,
    matchingCount: filteredRoles.length,
    roles: filteredRoles
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(outputPayload, null, 2), 'utf8');
  fs.writeFileSync(OUTPUT_JS, `window.MERCOR_LIVE_DATA = ${JSON.stringify(outputPayload, null, 2)};\n`, 'utf8');
  console.log(`[Mercor Sync] Successfully filtered and exported ${filteredRoles.length} approved roles to ${OUTPUT_JSON} and ${OUTPUT_JS}`);
  return outputPayload;
}

if (require.main === module) {
  syncMercorRoles().catch(err => {
    console.error('[Mercor Sync Error]', err);
    process.exit(1);
  });
}

module.exports = { syncMercorRoles };
