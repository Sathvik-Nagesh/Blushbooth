
import { FilterSettings, FilterType, TemplateType, BorderPattern } from '../types';

export const applyFiltersAndTemplate = async (
  images: string[],
  settings: FilterSettings,
  template: TemplateType,
  borderPattern: BorderPattern,
  width: number,
  height: number,
  showWatermark: boolean = true,
  preloadedImages?: HTMLImageElement[]
): Promise<string> => {
  return new Promise(async (resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx || images.length === 0) return resolve(images[0] || '');

    // Use preloaded images if available, otherwise load them
    let loadedImages: HTMLImageElement[] = [];
    if (preloadedImages && preloadedImages.length === images.length) {
        loadedImages = preloadedImages;
    } else {
        loadedImages = await Promise.all(
            images.map(src => new Promise<HTMLImageElement>((res) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => res(img);
                img.src = src;
            }))
        );
    }

    let canvasWidth = width;
    let canvasHeight = height;
    
    // --- Layout Calculation ---
    if (images.length === 1) {
       if (template === TemplateType.POLAROID) {
        canvasWidth = width + 60;
        canvasHeight = height + 180; // More bottom space
       } else if (template === TemplateType.SQUARE_FRAME) {
        const size = Math.max(width, height) + 100;
        canvasWidth = size;
        canvasHeight = size;
       }
    } else {
      if (template === TemplateType.STRIP) {
        // Authentic Strip Layout
        const photoWidth = width * 0.9; // Photos are narrower than canvas
        const photoHeight = photoWidth; // Square-ish photos in strip usually
        const gap = 30;
        const topPad = 60;
        const bottomPad = 60; // Reduced padding since no text
        const sidePad = (width - photoWidth) / 2;
        
        canvasWidth = width;
        canvasHeight = topPad + (photoHeight * images.length) + (gap * (images.length - 1)) + bottomPad;
      } else {
        // Grid
        canvasWidth = width;
        canvasHeight = height;
        if (template === TemplateType.POLAROID) {
             canvasHeight = height + 140; 
        }
      }
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // --- Background & Paper Texture ---
    ctx.fillStyle = '#fffdf9'; // Slightly off-white paper
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Pattern if selected
    if (borderPattern && borderPattern !== BorderPattern.NONE) {
        drawPattern(ctx, canvasWidth, canvasHeight, borderPattern);
    }
    
    // Subtle noise for paper texture (over pattern slightly)
    drawGrain(ctx, canvas.width, canvas.height, 5);


    // --- Filter Preparation ---
    const filters: string[] = [];
    filters.push(`brightness(${100 + settings.brightness}%)`);
    filters.push(`contrast(${100 + settings.contrast}%)`);
    filters.push(`blur(${settings.blur}px)`);

    if (settings.type === FilterType.GRAYSCALE) filters.push('grayscale(100%) contrast(110%)');
    if (settings.type === FilterType.SEPIA) filters.push('sepia(80%) contrast(90%)');
    if (settings.type === FilterType.WARM) filters.push('sepia(30%) hue-rotate(-10deg) saturate(110%)'); 
    if (settings.type === FilterType.COOL) filters.push('hue-rotate(20deg) saturate(90%) brightness(105%)'); 
    if (settings.type === FilterType.VINTAGE) filters.push('sepia(40%) contrast(85%) brightness(110%) hue-rotate(-10deg)');
    
    const filterString = filters.join(' ');

    // --- Drawing Logic ---
    ctx.save();
    
    if (images.length === 1) {
       const img = loadedImages[0];
       let drawX = 0; let drawY = 0;
       let drawW = width; let drawH = height;

       if (template === TemplateType.POLAROID) {
         drawX = 30; drawY = 30;
         
         // Inner shadow for inset look
         ctx.shadowColor = 'rgba(0,0,0,0.1)';
         ctx.shadowBlur = 10;
         ctx.shadowOffsetX = 2;
         ctx.shadowOffsetY = 2;
       } else if (template === TemplateType.SQUARE_FRAME) {
         const size = Math.max(width, height) + 100;
         drawX = 50;
         drawY = 50;
         drawW = size - 100;
         drawH = size - 100;
       }
       
       ctx.filter = filterString;
       ctx.drawImage(img, drawX, drawY, drawW, drawH);
       ctx.filter = 'none';
       ctx.shadowColor = 'transparent';

    } else if (template === TemplateType.STRIP) {
        const photoWidth = width * 0.9;
        const photoHeight = photoWidth; // Force square
        const sidePad = (width - photoWidth) / 2;
        const gap = 30;
        const topPad = 60;

        loadedImages.forEach((img, i) => {
           const y = topPad + (i * (photoHeight + gap));
           
           ctx.save();
           ctx.filter = filterString;
           // Draw Photo
           // Crop center square
           const sourceSize = Math.min(img.width, img.height);
           const sx = (img.width - sourceSize) / 2;
           const sy = (img.height - sourceSize) / 2;
           
           ctx.drawImage(img, sx, sy, sourceSize, sourceSize, sidePad, y, photoWidth, photoHeight);
           ctx.restore();

           // Inner border/shadow for depth
           ctx.strokeStyle = 'rgba(0,0,0,0.05)';
           ctx.lineWidth = 1;
           ctx.strokeRect(sidePad, y, photoWidth, photoHeight);
        });

    } else {
        // Grid
        const cols = 2;
        const rows = Math.ceil(images.length / cols);
        const cellW = canvasWidth / cols;
        const cellH = (template === TemplateType.POLAROID ? (canvasHeight - 140) : canvasHeight) / rows;
        
        ctx.filter = filterString;
        loadedImages.forEach((img, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            // Simple center crop logic could be added here
            ctx.drawImage(img, col * cellW, row * cellH, cellW, cellH);
        });
        ctx.filter = 'none';
    }
    ctx.restore();

    // --- Overlays ---
    
    // Grain Overlay
    if (settings.grain > 0) {
       drawGrain(ctx, canvas.width, canvas.height, settings.grain);
    }

    // Template Decorations
    if (template === TemplateType.POLAROID) {
      ctx.fillStyle = '#2c2c2c';
      // Change to clean sans-serif font
      ctx.font = 'bold 20px "Quicksand", sans-serif'; 
      ctx.textAlign = 'center';
      const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      ctx.fillText(date, canvas.width / 2, canvas.height - 50);
      
      // Optional: "BlushBooth" smaller below
      ctx.font = '12px Quicksand';
      ctx.fillStyle = '#888';
      ctx.fillText("blush booth memories", canvas.width / 2, canvas.height - 25);
    }
    
    if (showWatermark && template !== TemplateType.POLAROID && template !== TemplateType.STRIP) {
      ctx.font = 'bold 16px Quicksand';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; 
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'right';
      ctx.fillText("BlushBooth ✨", canvas.width - 20, canvas.height - 20);
      ctx.shadowColor = 'transparent';
    }

    resolve(canvas.toDataURL('image/png', 1.0));
  });
};

// --- Helper Functions ---

const drawPattern = (ctx: CanvasRenderingContext2D, w: number, h: number, type: BorderPattern) => {
    ctx.save();
    
    if (type === BorderPattern.DOTS) {
        ctx.fillStyle = '#fce7f3'; // pink-100
        const spacing = 40;
        for(let x=0; x<w; x+=spacing) {
            for(let y=0; y<h; y+=spacing) {
                if ((x/spacing + y/spacing) % 2 === 0) {
                    ctx.beginPath();
                    ctx.arc(x + 20, y + 20, 6, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        }
    } else if (type === BorderPattern.CHECKER) {
        const size = 60;
        ctx.fillStyle = '#fff1f2'; // rose-50
        for (let x=0; x<w; x+=size) {
            for(let y=0; y<h; y+=size) {
                 if ((x/size + y/size) % 2 === 0) {
                     ctx.fillRect(x, y, size, size);
                 }
            }
        }
    } else if (type === BorderPattern.HEARTS) {
        // Draw cute little hearts
        ctx.fillStyle = '#fecdd3'; // rose-200
        const spacing = 60;
        for(let x=0; x<w; x+=spacing) {
            for(let y=0; y<h; y+=spacing) {
                const offsetX = (y/spacing % 2) * (spacing/2); // stagger
                drawHeart(ctx, x + offsetX, y, 10);
            }
        }
    } else if (type === BorderPattern.STARS) {
        ctx.fillStyle = '#fef08a'; // yellow-200
        const spacing = 80;
        for(let x=0; x<w; x+=spacing) {
            for(let y=0; y<h; y+=spacing) {
                const offsetX = (y/spacing % 2) * (spacing/2); // stagger
                drawStar(ctx, x + offsetX + 10, y + 10, 5, 8, 4);
            }
        }
    } else if (type === BorderPattern.STRIPED) {
        ctx.strokeStyle = '#fbcfe8'; // pink-200
        ctx.lineWidth = 20;
        // Diagonal stripes
        for(let i=-h; i<w; i+=40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + h, h);
            ctx.stroke();
        }
    } else if (type === BorderPattern.FLORAL) {
        ctx.fillStyle = '#f9a8d4'; // pink-300
        const spacing = 70;
        for(let x=0; x<w; x+=spacing) {
            for(let y=0; y<h; y+=spacing) {
                 const offsetX = (y/spacing % 2) * (spacing/2); 
                 drawFlower(ctx, x + offsetX + 15, y + 15, 8);
            }
        }
    }

    ctx.restore();
}

const drawFlower = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) => {
    // Petals
    ctx.fillStyle = '#fda4af'; // rose-300
    for(let i=0; i<5; i++) {
        const angle = (Math.PI * 2 / 5) * i;
        ctx.beginPath();
        ctx.arc(
            cx + Math.cos(angle) * radius, 
            cy + Math.sin(angle) * radius, 
            radius, 0, Math.PI * 2
        );
        ctx.fill();
    }
    // Center
    ctx.fillStyle = '#fef08a'; // yellow-200
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
}

const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
  ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
  ctx.fill();
  ctx.restore();
}

const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius)
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y)
        rot += step

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y)
        rot += step
    }
    ctx.lineTo(cx, cy - outerRadius)
    ctx.closePath();
    ctx.fill();
}

const drawGrain = (ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) => {
  const grainSize = 100;
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = grainSize;
  patternCanvas.height = grainSize;
  const pCtx = patternCanvas.getContext('2d');
  if (!pCtx) return;

  const pixels = pCtx.createImageData(grainSize, grainSize);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const val = (Math.random() - 0.5) * 255 * (intensity / 100);
    pixels.data[i] = val;
    pixels.data[i+1] = val;
    pixels.data[i+2] = val;
    pixels.data[i+3] = 40; 
  }
  pCtx.putImageData(pixels, 0, 0);
  
  const pattern = ctx.createPattern(patternCanvas, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }
}
