# Extension Icons

## Design
The LinkedIn Lead Exporter icon features:
- **LinkedIn blue background** (#0A66C2) in a circular badge
- **Contact card** representing leads/contacts
- **Person icon** symbolizing LinkedIn profiles
- **Download arrow** indicating export/lead capture functionality

## Files
- `icon.svg` - Source SVG (scalable, editable)
- `icon16.png` - 16×16px (browser toolbar, small displays)
- `icon32.png` - 32×32px (browser toolbar @2x, favicon)
- `icon48.png` - 48×48px (extension management page)
- `icon128.png` - 128×128px (Chrome Web Store, installation)

## Regenerating Icons
If you modify `icon.svg`, regenerate PNG files with:
```bash
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 32x32 icon32.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

Requires ImageMagick (`sudo apt install imagemagick`)
