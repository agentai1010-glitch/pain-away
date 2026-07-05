const fs = require('fs');
const path = require('path');

const targetFiles = [
  'frontend/src/pages/landing/LandingPage.tsx',
  'frontend/src/pages/public/ServicesPage.tsx',
  'frontend/src/pages/public/ServiceDetailPage.tsx',
  'frontend/src/pages/public/ProductsPage.tsx',
  'frontend/src/pages/public/ProductDetailPage.tsx',
  'frontend/src/pages/public/CheckoutPage.tsx',
  'frontend/src/pages/public/SignInPage.tsx',
  'frontend/src/pages/public/portal/DashboardPage.tsx',
  'frontend/src/pages/public/portal/AppointmentsPage.tsx',
  'frontend/src/pages/public/portal/OrdersPage.tsx',
  'frontend/src/pages/public/portal/DocumentsPage.tsx',
  'frontend/src/components/public/PublicLayout.tsx'
];

function analyzeFile(filePath) {
  const fullPath = path.join('d:/PAIN_AWAY_1', filePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, i) => {
    // 1. Hardcoded large widths without max-w
    if (line.match(/\bw-(64|72|80|96|\[\d+px\])\b/) && !line.match(/\bmax-w-/)) {
      console.log(`[WIDTH] ${filePath}:${i+1} -> ${line.trim()}`);
    }
    
    // 2. Grids without mobile fallback
    if (line.match(/\bgrid-cols-(2|3|4|5|6)\b/) && !line.match(/\b(grid-cols-1|sm:|md:|lg:|xl:)\b/)) {
      console.log(`[GRID] ${filePath}:${i+1} -> ${line.trim()}`);
    }

    // 3. Overflow hidden that might truncate content unexpectedly, or lack of overflow-x-auto on tables
    if (line.match(/<table/)) {
      // Check a few lines up for overflow-x-auto
      let hasOverflow = false;
      for(let j=Math.max(0, i-2); j<=i; j++) {
        if(lines[j].includes('overflow-x-auto')) hasOverflow = true;
      }
      if(!hasOverflow) console.log(`[TABLE] ${filePath}:${i+1} -> Table might need overflow-x-auto`);
    }

    // 4. Large fixed heights that might break on mobile
    if (line.match(/\bh-(64|72|80|96|\[\d+px\])\b/) && !line.match(/\b(min-h-|md:|lg:)\b/)) {
      console.log(`[HEIGHT] ${filePath}:${i+1} -> ${line.trim()}`);
    }

    // 5. Flex container without wrap or col
    if (line.match(/className="[^"]*\bflex\b[^"]*"/) && !line.match(/\bflex-(col|wrap)\b/) && !line.match(/\b(md:|lg:|sm:)\b/)) {
      // These are often fine, but we'll flag them if they have multiple children
      // Too noisy, skipping.
    }
  });
}

targetFiles.forEach(analyzeFile);
