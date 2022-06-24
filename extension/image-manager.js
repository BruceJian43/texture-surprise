/**
 * @returns {Object}
 */
function getPickerOpts() {
  return pickerOpts = {
    types: [
      {
        description: 'Images',
        accept: {
          'image/*': ['.png', '.jpeg', '.jpg']
        }
      },
    ],
    excludeAcceptAllOption: true,
    multiple: true
  };
}

/**
 * @returns {Object}
 */
function getImageOpts() {
  return imageOpts = {
    width: 120,
    height: 120
  };
}

class ImageFile {
  /**
   * @param {String} filename 
   * @param {String} url 
   */
  constructor(filename, url) {
    /** @private @const */
    this.filename = filename;

    /** @private @const */
    this.url = url;
  }
}

class ImageManager {
  /**
   * @param {HTMLElement} containter
   */
  constructor(container) {
    /** @private @const */
    this.container = container;

    /** @private @const */
    this.pickerOpts = getPickerOpts();

    /** @private @const */
    this.imageOpts = getImageOpts();
  }

  /**
   * @async
   * @return {File[]} files
   */
  async loadFilesFromLocal() {
    const fileHandles = await window.showOpenFilePicker(this.pickerOpts);
    const files = await Promise.all(
      fileHandles.map((fileHandle) => fileHandle.getFile())
    );
    return files;
  }

  /**
   * @async
   * @param {ImageFile} image
   */
  async storeImageToExtension(image) {
    await chrome.storage.local.set({ [image.filename]: image.url });
  }

  /**
   * @param {ImageFile} image
   */
  displayImage(image) {
    if (image instanceof ImageFile &&
        this.container instanceof HTMLElement) {
      const img = document.createElement('img');
      img.src = image.url;
      img.width = this.imageOpts.width;
      img.height = this.imageOpts.height;
      img.title = image.filename;
      this.container.appendChild(img);
    }
  }

  /**
   * @param {Image[]} images 
   */
  displayImages(images) {
    for (const image of images) {
      this.displayImage(image);
    }
  }

  /**
   * @param {File} file 
   * @returns {Promise}
   */
  async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('error', () => {
        reject(reader.error);
      });
      reader.addEventListener('load', () => {
        resolve(new ImageFile(file.name, reader.result));
      });
      reader.readAsDataURL(file);
    })
  }

  /**
   * @async
   */
  async uploadImages() {
    try {
      const files = await this.loadFilesFromLocal();
      for (const file of files) {
        const image = await this.readFile(file);
        await this.removeImage(image.filename); // Replace the file with same filename.
        await this.storeImageToExtension(image);
        this.displayImage(image);
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * @async
   */
  async removeAllImages() {
    await chrome.storage.local.clear();
    if (this.container instanceof HTMLElement) {
      const imgs = this.container.querySelectorAll('img');
      for (const img of imgs) {
        img.remove();
      }
    }
  }

  /**
   * @async
   * @param {String} filename
   */
  async removeImage(filename) {
    await chrome.storage.local.remove(filename);
    const removedImg = this.container.querySelector(`img[title="${filename}"]`);
    if (removedImg != null) {
      removedImg.remove();
    }
  }

  /**
   * @async
   */
  async init() {
    const images = await ImageManager.loadImagesFromExtension();
    this.displayImages(images);
  }

  /**
   * @async
   * @static
   * @return {ImageFile[]} images
   */
  static async loadImagesFromExtension() {
    const result = await chrome.storage.local.get(null);
    const filenames = Array.from(Object.keys(result));
    const images = filenames.map((filename) => new ImageFile(filename, result[filename]))
    return images
  }

  /**
   * @async
   * @static
   * @returns { (ImageFile|null) } images[idx]
   */
  static async getRandomImage() {
    const images = await ImageManager.loadImagesFromExtension();
    if (images.length == 0) {
      return null;
    }
    const idx = Math.floor(Math.random() * images.length);
    return images[idx];
  }

  /**
   * @async
   * @static
   * @returns { (ImageFile|null) } images[idx]
   */
  static async getImage(filename) {
    const result = await chrome.storage.local.get();
    if (filename in result) {
      return new ImageFile(filename, result[filename]);
    } else {
      return null;
    }
  }
}

