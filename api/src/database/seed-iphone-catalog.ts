import { IsNull } from 'typeorm';
import { Repositories } from './database.service';
import { IPHONE_CATALOG } from './iphone-catalog';

const SWATCHES: Record<string, string> = {
  'PRODUCT RED': '#c92f3f',
  'Alpine Green': '#526b55',
  Black: '#303133',
  'Black Titanium': '#454646',
  Blue: '#7496ba',
  'Blue Titanium': '#505e70',
  Burgundy: '#693446',
  'Cloud White': '#f1f0eb',
  Coral: '#ee7b67',
  'Cosmic Orange': '#d88756',
  'Deep Blue': '#32485e',
  'Deep Purple': '#655a73',
  'Desert Titanium': '#c6b09b',
  Glacier: '#b8d1da',
  Gold: '#d8c5ab',
  Graphite: '#595954',
  Green: '#a8c3b3',
  Lavender: '#b8acd0',
  'Light Gold': '#eadcc1',
  Midnight: '#303943',
  'Midnight Green': '#52615c',
  'Mist Blue': '#b4cbd9',
  'Natural Titanium': '#b5afa5',
  'Pacific Blue': '#426779',
  Pink: '#e9c7d0',
  Purple: '#b9afcc',
  Sage: '#a5b69d',
  'Sierra Blue': '#a4bdd1',
  Silver: '#dedfdc',
  'Sky Blue': '#acc9db',
  'Soft Pink': '#f1d3da',
  'Space Black': '#3b3b3b',
  'Space Gray': '#737477',
  Starlight: '#eee8dc',
  Teal: '#80aba8',
  Ultramarine: '#5e72b8',
  White: '#f3f3ef',
  'White Titanium': '#e5e2db',
  Yellow: '#ecd478',
};

const labelKey = (label: string) => label.toLowerCase().replace(/[()\s]/g, '');

/** Add catalogue records and missing relations; preserve custom models, prices and existing edits. */
export async function seedIphoneCatalog(db: Repositories) {
  const colors = await db.deviceColor.find({ where: { deletedAt: IsNull() } });
  const sizes = await db.deviceStorageSize.find({
    where: { deletedAt: IsNull() },
  });
  const models = await db.deviceModel.find({
    where: { deletedAt: IsNull() },
    relations: { availableColors: true, availableStorageSizes: true },
  });
  const byColor = new Map(colors.map((c) => [labelKey(c.name), c]));
  const bySize = new Map(
    sizes.map((s) => [s.size.toUpperCase().replace(/\s/g, ''), s]),
  );
  const byModel = new Map(models.map((m) => [labelKey(m.name), m]));
  let nextModel = Math.max(0, ...models.map((m) => m.index)) + 1;
  for (const item of IPHONE_CATALOG) {
    const availableColors = [];
    const availableStorageSizes = [];
    for (const name of item.colors) {
      let color = byColor.get(labelKey(name));
      if (!color) {
        color = await db.deviceColor.save(
          db.deviceColor.create({ name, hex: SWATCHES[name], active: true }),
        );
        byColor.set(labelKey(name), color);
      }
      if (color.name.includes('(') || color.name.includes(')')) {
        color.name = name;
        color = await db.deviceColor.save(color);
      }
      availableColors.push(color);
    }
    for (const size of item.storage) {
      const key = size.toUpperCase().replace(/\s/g, '');
      let storage = bySize.get(key);
      if (!storage) {
        const capacity = parseInt(size) * (size.includes('TB') ? 1024 : 1);
        storage = await db.deviceStorageSize.save(
          db.deviceStorageSize.create({ size, index: capacity, active: true }),
        );
        bySize.set(key, storage);
      }
      availableStorageSizes.push(storage);
    }
    let model = byModel.get(labelKey(item.name));
    if (!model) {
      model = db.deviceModel.create({
        name: item.name,
        index: nextModel++,
        active: true,
        availableColors,
        availableStorageSizes,
      });
    } else {
      if (model.name.includes('(') || model.name.includes(')'))
        model.name = item.name;
      model.availableColors = [
        ...new Map(
          [...model.availableColors, ...availableColors].map((c) => [c.id, c]),
        ).values(),
      ];
      model.availableStorageSizes = [
        ...new Map(
          [...model.availableStorageSizes, ...availableStorageSizes].map(
            (s) => [s.id, s],
          ),
        ).values(),
      ];
    }
    const saved = await db.deviceModel.save(model);
    byModel.set(labelKey(item.name), saved);
  }
  return {
    models: IPHONE_CATALOG.length,
    colors: byColor.size,
    storageSizes: bySize.size,
  };
}
