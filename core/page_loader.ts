import { Page } from "./filesystem.ts";

import type { Format, Reader } from "../core.ts";

export interface Options {
  /** The reader instance used to read the files */
  reader: Reader;
}

/**
 * Class to load page files that generate assets (css, js, etc).
 */
export default class PageLoader {
  /** The filesystem reader */
  reader: Reader;

  constructor(options: Options) {
    this.reader = options.reader;
  }

  /** Load an asset Page */
  async load(
    path: string,
    format: Format,
  ): Promise<Page | undefined> {
    if (!format.pageLoader) {
      return;
    }

    const info = await this.reader.getInfo(path);

    if (!info) {
      return;
    }

    const { ext, asset } = format;

    // Create the page
    const page = new Page({
      path: path.slice(0, -ext.length),
      lastModified: info?.mtime || undefined,
      created: info?.birthtime || undefined,
      remote: info.remote,
      ext,
      asset,
    });

    // Load the data
    const data = await this.reader.read(path, format.pageLoader);
    Object.assign(page.baseData, data);
    return page;
  }
}
