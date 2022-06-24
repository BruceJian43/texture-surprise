const container = document.querySelector('.gallery');
if (container == null) {
  alert('Gallery not found');
  throw new Error('Gallery not found');
}

function setupButtons() {
  const uploadButton = document.querySelector('.btn-upload');
  uploadButton.addEventListener('click', async () => {
    if (removeButton.classList.contains('removable')) {
      removeButton.click();
    }
    await imageManager.uploadImages();
  });

  const removeButton = document.querySelector('.btn-remove');
  removeButton.addEventListener('click', () => {
    const imgs = container.querySelectorAll('img');
    removeButton.classList.toggle('removable');
    for (const img of imgs) {
      img.classList.toggle('removable');
    }
  });

  const clearButton = document.querySelector('.btn-clear');
  clearButton.addEventListener('click', async () => {
    if (removeButton.classList.contains('removable')) {
      removeButton.click();
    }
    await imageManager.removeAllImages();
  });
}

const imageManager = new ImageManager(container);

const observer = new MutationObserver((mutations, observer) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeName == 'IMG') {
        node.addEventListener('click', async () => {
          if (node.classList.contains('removable')) {
            await imageManager.removeImage(node.title);
          }
        });
      }
    }
  }
})
observer.observe(container, {childList: true});

imageManager.init()
  .then(() => {
    setupButtons();
  })
  .catch((e) => {
    alert(e);
  });


