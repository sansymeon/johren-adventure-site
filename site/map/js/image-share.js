/**
 * Export a branded copy of a player image, then save it or open the
 * device share sheet. The source picture is not modified.
 * No account, upload, gallery, or social network.
 */
(function (global) {
  "use strict";

  var settings = {
    title: "TURBO ADVENTURES",
    site: "johrenadventure.com",
    page: "https://johrenadventure.com",
    fontFamily: "Georgia, \"Times New Roman\", serif",
    sizeRatio: 0.028,
    minSize: 15,
    maxSize: 40,
    marginRatio: 0.04
  };

  function configure(next) {
    if (!next) return settings;
    Object.keys(next).forEach(function (key) {
      if (next[key] != null && key in settings) settings[key] = next[key];
    });
    return settings;
  }

  function japanese() {
    var lang = (document.documentElement.lang || "").toLowerCase();
    return lang.indexOf("ja") === 0;
  }

  function appleTouch() {
    var points = navigator.maxTouchPoints || 0;
    if (points < 1) return false;
    var agent = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(agent)) return true;
    return navigator.platform === "MacIntel" && points > 1;
  }

  function loadImage(source) {
    return new Promise(function (resolve, reject) {
      if (source instanceof HTMLImageElement && source.naturalWidth) {
        resolve(source);
        return;
      }
      var image = new Image();
      var objectUrl = "";
      image.onload = function () {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = function () { reject(new Error("image")); };
      if (typeof Blob !== "undefined" && source instanceof Blob) {
        objectUrl = URL.createObjectURL(source);
        image.src = objectUrl;
        return;
      }
      image.crossOrigin = "anonymous";
      image.src = String(source || "");
    });
  }

  function luminance(data) {
    var total = 0;
    var count = 0;
    var i;
    for (i = 0; i < data.length; i += 16) {
      total += data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
      count += 1;
    }
    return count ? total / count : 128;
  }

  function brandCanvas(image) {
    var canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    var context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    var size = Math.round(Math.min(canvas.width, canvas.height) * settings.sizeRatio);
    size = Math.max(settings.minSize, Math.min(settings.maxSize, size));
    var margin = Math.round(Math.min(canvas.width, canvas.height) * settings.marginRatio);
    context.font = "700 " + size + "px " + settings.fontFamily;
    var titleWidth = context.measureText(settings.title).width;
    context.font = "400 " + Math.round(size * 0.78) + "px " + settings.fontFamily;
    var siteWidth = context.measureText(settings.site).width;
    var blockWidth = Math.ceil(Math.max(titleWidth, siteWidth) + size);
    var blockHeight = Math.ceil(size * 2.15);
    var x = canvas.width - margin - blockWidth;
    var y = canvas.height - margin - blockHeight;
    if (x < margin) x = margin;
    var sample = context.getImageData(
      Math.max(0, x),
      Math.max(0, y),
      Math.min(blockWidth, canvas.width),
      Math.min(blockHeight, canvas.height)
    );
    var light = luminance(sample.data) > 150;
    var ink = light ? "rgba(28, 23, 18, 0.88)" : "rgba(255, 250, 244, 0.92)";
    var plate = light ? "rgba(255, 250, 244, 0.55)" : "rgba(28, 23, 18, 0.42)";
    context.fillStyle = plate;
    context.beginPath();
    if (context.roundRect) context.roundRect(x, y, blockWidth, blockHeight, size * 0.35);
    else context.rect(x, y, blockWidth, blockHeight);
    context.fill();
    context.fillStyle = ink;
    context.textAlign = "right";
    context.textBaseline = "top";
    context.font = "700 " + size + "px " + settings.fontFamily;
    context.fillText(settings.title, x + blockWidth - size * 0.45, y + size * 0.28);
    context.font = "400 " + Math.round(size * 0.78) + "px " + settings.fontFamily;
    context.fillText(settings.site, x + blockWidth - size * 0.45, y + size * 1.15);
    return canvas;
  }

  function canvasFile(canvas, filename) {
    var png = /\.png$/i.test(filename);
    var name = png ? filename : filename.replace(/\.png$/i, ".jpg");
    if (!/\.(jpg|jpeg|png)$/i.test(name)) name += png ? ".png" : ".jpg";
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        resolve(new File([blob], name, { type: blob.type || (png ? "image/png" : "image/jpeg") }));
      }, png ? "image/png" : "image/jpeg", 0.92);
    });
  }

  function brandedFile(source, filename) {
    return loadImage(source).then(brandCanvas).then(function (canvas) {
      return canvasFile(canvas, filename || "turbo-adventures.jpg");
    });
  }

  function download(file) {
    var url = URL.createObjectURL(file);
    var link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function hold(file) {
    var existing = document.getElementById("turbo-image-hold");
    if (existing) existing.remove();
    var url = URL.createObjectURL(file);
    var panel = document.createElement("section");
    panel.id = "turbo-image-hold";
    panel.style.cssText = "position:fixed;inset:0;z-index:80;background:rgba(28,23,18,.72);display:grid;place-items:center;padding:16px;";
    panel.innerHTML = '<div style="background:#fffaf4;color:#1c1712;max-width:24rem;padding:16px;border-radius:12px;display:grid;gap:12px;">' +
      "<p>" + (japanese() ? "画像を長押しして、写真に保存してください。" : "Touch and hold the picture, then save it to Photos.") + "</p>" +
      '<img alt="" style="width:100%;height:auto;border-radius:8px;">' +
      '<button type="button">' + (japanese() ? "閉じる" : "Close") + "</button></div>";
    panel.querySelector("img").src = url;
    panel.querySelector("button").addEventListener("click", function () {
      URL.revokeObjectURL(url);
      panel.remove();
    });
    document.body.appendChild(panel);
  }

  function linkChoice() {
    var existing = document.getElementById("turbo-share-link");
    if (existing) existing.remove();
    var panel = document.createElement("section");
    panel.id = "turbo-share-link";
    panel.style.cssText = "position:fixed;inset:0;z-index:80;background:rgba(28,23,18,.72);display:grid;place-items:center;padding:16px;";
    panel.innerHTML = '<div style="background:#fffaf4;color:#1c1712;max-width:24rem;padding:16px;border-radius:12px;display:grid;gap:12px;">' +
      "<p>" + (japanese()
        ? "画像を保存しました。このブラウザは画像のシェアに対応していないため、サイトのリンクは別の操作です。"
        : "The image was saved. This browser cannot share the image file, so the website link is a separate action.") + "</p>" +
      '<button type="button" data-link>' + (japanese() ? "サイトをシェア" : "Share the website") + "</button>" +
      '<button type="button" data-close>' + (japanese() ? "閉じる" : "Close") + "</button></div>";
    panel.querySelector("[data-close]").addEventListener("click", function () { panel.remove(); });
    panel.querySelector("[data-link]").addEventListener("click", function () {
      var payload = { url: settings.page };
      if (navigator.share) {
        navigator.share(payload).catch(function () { return null; });
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(settings.page);
      }
    });
    document.body.appendChild(panel);
  }

  function canShareFile(file) {
    if (!navigator.share || !navigator.canShare) return false;
    try {
      return navigator.canShare({ files: [file] });
    } catch (error) {
      return false;
    }
  }

  function save(source, filename) {
    return brandedFile(source, filename).then(function (file) {
      if (appleTouch() && canShareFile(file)) {
        return navigator.share({ files: [file] }).catch(function (error) {
          if (error && error.name === "AbortError") return null;
          hold(file);
          return null;
        });
      }
      if (appleTouch()) {
        hold(file);
        return null;
      }
      download(file);
      return null;
    });
  }

  function share(source, filename) {
    var message = "";
    if (global.TURBO_I18N && global.TURBO_I18N.t) message = global.TURBO_I18N.t("shareMessage");
    if (!message) {
      message = japanese()
        ? "ターボアドベンチャーズで絵を作りました！🐢\nhttps://johrenadventure.com"
        : "I made a picture in Turbo Adventures! 🐢\nhttps://johrenadventure.com";
    }
    return brandedFile(source, filename).then(function (file) {
      if (canShareFile(file)) {
        return navigator.share({ files: [file], text: message }).catch(function (error) {
          if (error && error.name === "AbortError") return null;
          download(file);
          linkChoice();
          return null;
        });
      }
      download(file);
      linkChoice();
      return null;
    });
  }

  global.TURBO_IMAGE_SHARE = {
    settings: settings,
    configure: configure,
    brandCanvas: brandCanvas,
    save: save,
    share: share
  };
})(window);
