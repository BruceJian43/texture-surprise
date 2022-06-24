const BLOCK_URL_PATTERN = ['20', '24', '32', '40', '48', '88', '96', '176'].map((num) => `//miro.medium.com/fit/c/${num}`);

/**
 * @async
 * @param {HTMLElement} element
 * @param {Map} cache
 */
async function textureSurprise(element, cache) {
  if (!(element instanceof HTMLElement)) {
    return;
  }
  const imgs = element.querySelectorAll('img');
  for (const img of imgs) {
    const isTarget = BLOCK_URL_PATTERN.some((url) => img.src.indexOf(url) != -1);
    if (isTarget) {
      const image = cache.has(img.alt) ?
          await ImageManager.getImage(cache.get(img.alt)) :
          await ImageManager.getRandomImage();
      if (image != null) {
        img.src = image.url;
        cache.set(img.alt, image.filename);
      }
    }
  }
}

const cache = new Map();
textureSurprise(document.body, cache)
  .then(() => {
    const bodyObserver = new MutationObserver(async (mutations, observer) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          await textureSurprise(node, cache);
        }
      }
    });
    bodyObserver.observe(document.body, {childList: true, subtree: true});
  })
  .catch((e) => {
    console.log(e);
  })
