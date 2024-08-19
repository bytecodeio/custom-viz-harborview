function getRGBComponents(color: string) {
  let r = 0, g = 0, b = 0;
  // Check if color is in hexadecimal format
  if (color[0] === '#') {
    const hex = color.slice(1);
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
  }
  return [r, g, b];
}

function relativeLuminance(rgb: number[]) {
  return rgb.map((value) => {
    value /= 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  }).reduce((acc, val, i) => acc + val * [0.2126, 0.7152, 0.0722][i], 0);
}

function contrastRatio(L1: number, L2: number) {
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

function getBestTextColor(backgroundHexColor: string) {
  const backgroundLuminance = relativeLuminance(getRGBComponents(backgroundHexColor));
  const blackLuminance = relativeLuminance([0, 0, 0]);
  const whiteLuminance = relativeLuminance([255, 255, 255]);

  const blackContrast = contrastRatio(backgroundLuminance, blackLuminance);
  const whiteContrast = contrastRatio(backgroundLuminance, whiteLuminance);

  return blackContrast > whiteContrast ? 'black' : 'white';
}

export default getBestTextColor;