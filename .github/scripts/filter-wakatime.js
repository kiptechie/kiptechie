/**
 * This script filters the generated WakaTime SVG to only show languages with 10+ hours.
 */
const fs = require('fs');

const svgPath = 'assets/wakatime.svg';

try {
  let svg = fs.readFileSync(svgPath, 'utf8');

  // Match each language block. The languages are wrapped in <g transform="translate(0, Y)"> ... </g>
  const regex = /<g transform="translate\(0, \d+\)">\s*<g class="stagger"[\s\S]*?<\/g>\s*<\/g>/g;

  let yOffset = 0;

  svg = svg.replace(regex, (match) => {
      // Extract the time string (e.g., "1,721 hrs 18 mins", "53 mins")
      const timeMatch = match.match(/>([^<]+(?:hrs|mins|hr|min)[^<]*)<\/text>/);
      if (!timeMatch) return match;
      const timeStr = timeMatch[1];
      
      let hours = 0;
      const hrMatch = timeStr.match(/([\d,]+)\s*hr/);
      if (hrMatch) {
          // Parse hours, removing any commas
          hours = parseInt(hrMatch[1].replace(/,/g, ''), 10);
      }
      
      // Keep only if hours >= 10
      if (hours >= 10) {
          // Adjust the translate Y offset so there are no gaps between items
          const modifiedMatch = match.replace(/<g transform="translate\(0, \d+\)">/, `<g transform="translate(0, ${yOffset})">`);
          yOffset += 25; // 25px is the vertical spacing between items
          return modifiedMatch;
      } else {
          return ''; // Remove this language
      }
  });

  // Adjust the SVG height to match the new content
  // The main-card-body starts at y=55. Add yOffset + 45 for bottom padding.
  const newHeight = yOffset + 55 + 45; 
  svg = svg.replace(/<svg\s+width="495"\s+height="\d+"/, `<svg width="495" height="${newHeight}"`);
  svg = svg.replace(/viewBox="0 0 495 \d+"/, `viewBox="0 0 495 ${newHeight}"`);

  fs.writeFileSync(svgPath, svg);
  console.log('Successfully filtered WakaTime SVG (10+ hours only).');
} catch (error) {
  console.error('Error filtering WakaTime SVG:', error.message);
  process.exit(1);
}
