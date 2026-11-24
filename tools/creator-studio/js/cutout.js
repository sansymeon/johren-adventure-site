/* Display-only matte removal. Source files in turbo_adventure/ are never written. */
(function () {
  const cache = new Map();
  const pending = new Map();

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("Image failed")); };
      image.src = url;
    });
  }

  function dist(r, g, b, color) {
    const dr = r - color[0];
    const dg = g - color[1];
    const db = b - color[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function isLightNeutral(r, g, b, a) {
    return a > 200 && Math.max(r, g, b) - Math.min(r, g, b) < 26 && Math.min(r, g, b) > 168;
  }

  /* A baked checkerboard is a light two-tone pattern covering the border. True cutouts have a clear border. */
  function checkerColors(data, width, height) {
    const samples = [];
    function take(x, y) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (isLightNeutral(r, g, b, a)) samples.push([r, g, b]);
    }
    const step = Math.max(1, Math.floor(width / 180));
    for (let x = 0; x < width; x += step) {
      take(x, 0);
      take(x, 1);
      take(x, height - 1);
    }
    for (let y = 0; y < height; y += step) {
      take(0, y);
      take(width - 1, y);
    }
    const borderCount = Math.ceil(width / step) * 2 + Math.ceil(height / step) * 2;
    if (samples.length < borderCount * 0.45 || samples.length < 24) return null;
    const luminances = samples.map(function (c) { return c[0] + c[1] + c[2]; }).sort(function (a, b) { return a - b; });
    const mid = luminances[Math.floor(luminances.length / 2)];
    const groups = [[], []];
    samples.forEach(function (color) {
      groups[(color[0] + color[1] + color[2]) >= mid ? 1 : 0].push(color);
    });
    function average(group) {
      if (!group.length) return null;
      const sum = group.reduce(function (acc, color) {
        return [acc[0] + color[0], acc[1] + color[1], acc[2] + color[2]];
      }, [0, 0, 0]);
      return [sum[0] / group.length, sum[1] / group.length, sum[2] / group.length];
    }
    const darker = average(groups[0]);
    const lighter = average(groups[1]);
    if (!darker || !lighter) return null;
    if (dist(lighter[0], lighter[1], lighter[2], darker) < 14) return [lighter];
    let switches = 0;
    let previous = -1;
    for (let x = 0; x < width; x += 2) {
      const i = x * 4;
      if (!isLightNeutral(data[i], data[i + 1], data[i + 2], data[i + 3])) {
        previous = -1;
        continue;
      }
      const tone = dist(data[i], data[i + 1], data[i + 2], lighter) < dist(data[i], data[i + 1], data[i + 2], darker) ? 1 : 0;
      if (previous !== -1 && tone !== previous) switches += 1;
      previous = tone;
    }
    if (switches < 6) return null;
    return [darker, lighter];
  }

  function knockOut(imageData, colors) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    const seen = new Uint8Array(width * height);
    const queue = [];
    function matches(index) {
      const offset = index * 4;
      const r = pixels[offset];
      const g = pixels[offset + 1];
      const b = pixels[offset + 2];
      for (let c = 0; c < colors.length; c += 1) {
        if (dist(r, g, b, colors[c]) < 46) return true;
      }
      return false;
    }
    function push(x, y) {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const index = y * width + x;
      if (seen[index] || !matches(index)) return;
      seen[index] = 1;
      queue.push(index);
    }
    for (let x = 0; x < width; x += 1) {
      push(x, 0);
      push(x, height - 1);
    }
    for (let y = 0; y < height; y += 1) {
      push(0, y);
      push(width - 1, y);
    }
    let read = 0;
    while (read < queue.length) {
      const index = queue[read];
      read += 1;
      pixels[index * 4 + 3] = 0;
      const x = index % width;
      const y = (index / width) | 0;
      push(x + 1, y);
      push(x - 1, y);
      push(x, y + 1);
      push(x, y - 1);
    }
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = y * width + x;
        if (seen[index]) continue;
        if (!seen[index - 1] && !seen[index + 1] && !seen[index - width] && !seen[index + width]) continue;
        const offset = index * 4;
        let closest = Infinity;
        for (let c = 0; c < colors.length; c += 1) {
          closest = Math.min(closest, dist(pixels[offset], pixels[offset + 1], pixels[offset + 2], colors[c]));
        }
        if (closest < 72) {
          const alpha = Math.round(Math.min(255, (closest / 72) * 255));
          if (alpha < pixels[offset + 3]) pixels[offset + 3] = alpha;
        }
      }
    }
  }

  function prepare(url) {
    if (cache.has(url)) return Promise.resolve(cache.get(url));
    if (pending.has(url)) return pending.get(url);
    const job = loadImage(url).then(function (image) {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      let imageData;
      try {
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      } catch (error) {
        cache.set(url, url);
        return url;
      }
      const colors = checkerColors(imageData.data, canvas.width, canvas.height);
      if (!colors) {
        cache.set(url, url);
        return url;
      }
      knockOut(imageData, colors);
      context.putImageData(imageData, 0, 0);
      return new Promise(function (resolve) {
        canvas.toBlob(function (blob) {
          const cleaned = blob ? URL.createObjectURL(blob) : url;
          cache.set(url, cleaned);
          resolve(cleaned);
        }, "image/png");
      });
    }).catch(function () {
      cache.set(url, url);
      return url;
    });
    pending.set(url, job);
    job.then(function () { pending.delete(url); });
    return job;
  }

  window.TASCutout = { prepare: prepare };
})();
