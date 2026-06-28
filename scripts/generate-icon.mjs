import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "build");
const iconsetDir = join(outDir, "icon.iconset");
mkdirSync(outDir, { recursive: true });
mkdirSync(iconsetDir, { recursive: true });

function rgba(hex, alpha = 255) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
    alpha,
  ];
}

function crc32(buf) {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return ~c >>> 0;
}

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n);
  return b;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  return Buffer.concat([u32(data.length), typeBuf, data, u32(crc32(Buffer.concat([typeBuf, data])))]);
}

function renderPng(size) {
  const scale = size / 64;
  const pixels = Array.from({ length: size }, () => Array.from({ length: size }, () => [0, 0, 0, 0]));

  function rect(x, y, w, h, color) {
    const px = Math.round(x * scale);
    const py = Math.round(y * scale);
    const pw = Math.round(w * scale);
    const ph = Math.round(h * scale);
    for (let yy = Math.max(0, py); yy < Math.min(size, py + ph); yy += 1) {
      for (let xx = Math.max(0, px); xx < Math.min(size, px + pw); xx += 1) {
        pixels[yy][xx] = color;
      }
    }
  }

  const cream = rgba("#eee6d7");
  const hi = rgba("#f8f1e5");
  const lo = rgba("#d7cdbb");
  const dark = rgba("#151516");
  const panel = rgba("#2a2a2b");
  const grey = rgba("#565657");
  const greyHi = rgba("#77736c");
  const amber = rgba("#c8a86a");
  const good = rgba("#bfe6a8");
  const eye = rgba("#e8dfc9");

  rect(7, 7, 50, 50, rgba("#2a2a2b"));
  rect(9, 9, 46, 46, rgba("#fffaf0"));
  rect(11, 11, 42, 42, rgba("#f4f0e8"));
  rect(12, 12, 40, 5, rgba("#fffaf0"));
  rect(12, 48, 40, 4, rgba("#d7cdbb"));

  rect(14, 46, 36, 7, grey);
  rect(16, 44, 32, 3, greyHi);
  rect(18, 47, 4, 1, amber);
  rect(16, 37, 32, 8, rgba("#343436"));
  rect(18, 36, 28, 3, rgba("#4c4c4e"));
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 10; col += 1) rect(19 + col * 2, 38 + row * 3, 1, 1, rgba("#8b8b88"));
  }
  rect(29, 43, 8, 1, rgba("#8b8b88"));

  rect(18, 13, 28, 27, cream);
  rect(20, 11, 24, 3, hi);
  rect(18, 38, 28, 2, lo);
  rect(17, 16, 1, 20, lo);
  rect(46, 16, 1, 20, rgba("#c9beaa"));
  rect(22, 40, 5, 4, panel);
  rect(38, 40, 5, 4, panel);

  rect(21, 18, 22, 13, panel);
  rect(22, 19, 20, 11, dark);
  rect(26, 22, 4, 2, eye);
  rect(35, 22, 4, 2, eye);
  rect(30, 27, 6, 1, good);

  rect(25, 21, 7, 1, panel);
  rect(25, 21, 1, 5, panel);
  rect(31, 21, 1, 5, panel);
  rect(34, 21, 7, 1, panel);
  rect(34, 21, 1, 5, panel);
  rect(40, 21, 1, 5, panel);
  rect(32, 23, 2, 1, panel);

  rect(15, 32, 7, 4, cream);
  rect(43, 33, 7, 4, lo);
  rect(42, 12, 8, 5, rgba("#fffaf0"));
  rect(43, 13, 1, 1, panel);
  rect(45, 13, 1, 1, panel);
  rect(47, 13, 1, 1, panel);
  rect(44, 17, 2, 2, rgba("#fffaf0"));

  const raw = Buffer.concat(pixels.map((row) => Buffer.from([0, ...row.flat()])));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function u16le(n) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n);
  return b;
}

function u32le(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n);
  return b;
}

function writeIco(entries, file) {
  const header = Buffer.concat([u16le(0), u16le(1), u16le(entries.length)]);
  let offset = 6 + entries.length * 16;
  const directory = [];
  for (const entry of entries) {
    const sizeByte = entry.size >= 256 ? 0 : entry.size;
    directory.push(Buffer.concat([
      Buffer.from([sizeByte, sizeByte, 0, 0]),
      u16le(1),
      u16le(32),
      u32le(entry.png.length),
      u32le(offset),
    ]));
    offset += entry.png.length;
  }
  writeFileSync(file, Buffer.concat([header, ...directory, ...entries.map((entry) => entry.png)]));
}

function writeIcns(entries, file) {
  const typeBySize = new Map([
    [16, "ic04"],
    [32, "ic05"],
    [128, "ic07"],
    [256, "ic08"],
    [512, "ic09"],
    [1024, "ic10"],
  ]);
  const chunks = entries
    .filter((entry) => typeBySize.has(entry.size))
    .map((entry) => {
      const type = Buffer.from(typeBySize.get(entry.size));
      const length = u32(entry.png.length + 8);
      return Buffer.concat([type, length, entry.png]);
    });
  writeFileSync(file, Buffer.concat([Buffer.from("icns"), u32(8 + chunks.reduce((sum, item) => sum + item.length, 0)), ...chunks]));
}

const iconsetFiles = [
  ["icon_16x16.png", 16],
  ["icon_16x16@2x.png", 32],
  ["icon_32x32.png", 32],
  ["icon_32x32@2x.png", 64],
  ["icon_128x128.png", 128],
  ["icon_128x128@2x.png", 256],
  ["icon_256x256.png", 256],
  ["icon_256x256@2x.png", 512],
  ["icon_512x512.png", 512],
  ["icon_512x512@2x.png", 1024],
];

const pngBySize = new Map([16, 32, 48, 64, 128, 256, 512, 1024].map((size) => [size, renderPng(size)]));

writeFileSync(join(outDir, "icon.png"), pngBySize.get(1024));
for (const [name, size] of iconsetFiles) writeFileSync(join(iconsetDir, name), pngBySize.get(size));
writeIco([16, 32, 48, 64, 128, 256].map((size) => ({ size, png: pngBySize.get(size) })), join(outDir, "icon.ico"));
writeIcns([16, 32, 128, 256, 512, 1024].map((size) => ({ size, png: pngBySize.get(size) })), join(outDir, "icon.icns"));

console.log(join(outDir, "icon.png"));
console.log(join(outDir, "icon.ico"));
console.log(join(outDir, "icon.icns"));
