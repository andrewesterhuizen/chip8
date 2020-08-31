export default class RomLoader {
  async load(url) {
    return (await fetch(url)).arrayBuffer();
  }
}
