const fs = require('fs');
const path = require('path');

// CONFIGURATION - Edit these values
const TOTAL_SLIDES = 10; // Change this to match your number of slides

// Define your sections here
const sections = [
  { title: 'Introduction', startSlide: 1, level: 0 },
  { title: 'Background', startSlide: 3, level: 1 },
  { title: 'Main Content', startSlide: 4, level: 0 },
  { title: 'Topic A', startSlide: 5, level: 1 },
  { title: 'Subtopic A1', startSlide: 6, level: 2 },
  { title: 'Topic B', startSlide: 7, level: 1 },
  { title: 'Conclusion', startSlide: 9, level: 0 },
];

// Generate slides array
const slides = Array.from({ length: TOTAL_SLIDES }, (_, i) => ({
  id: i + 1,
  thumbnail: `/slides/thumbnails/slide-${String(i + 1).padStart(4, '0')}.jpg`,
  full: `/slides/full/slide-${String(i + 1).padStart(4, '0')}.jpg`,
  highRes: `/slides/high-res/slide-${String(i + 1).padStart(4, '0')}.jpg`,
}));

// Create metadata object
const metadata = {
  totalPages: TOTAL_SLIDES,
  slides,
  sections,
};

// Write to file
const outputPath = path.join(__dirname, 'public/slides/metadata.json');
fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));

console.log('✅ metadata.json generated successfully!');
console.log(`📊 Total slides: ${TOTAL_SLIDES}`);
console.log(`📑 Total sections: ${sections.length}`);
console.log(`📁 Output: ${outputPath}`);
