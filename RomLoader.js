export default class RomLoader {
  async load(url) {
    const request = await fetch(url);
    const buffer = await request.arrayBuffer();
    return new Uint8Array(buffer);
  }
}
