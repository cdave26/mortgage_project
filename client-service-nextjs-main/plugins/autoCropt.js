/**
 * Auto Crop image
 * @param {File} file
 * @param {Number} width
 * @param {Number} height
 *  @returns {Promise<File>}
 */

export const autoCrop = (file, width, height) => {
    return new Promise((resolve, reject) => {
        const isValid = file instanceof File;
        if (!isValid) {
            reject(new Error('File is not valid'));
        }
        //check if number width and height
        if (typeof width !== 'number' || typeof height !== 'number') {
            reject(new Error('Width and height must be number'));
        }

        if (typeof width !== 'number') {
            reject(new Error('Width must be number'));
        }

        if (typeof height !== 'number') {
            reject(new Error('Height must be number'));
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = e.target.result;
            img.onload = (e) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const scaleSize = width / img.width;
                canvas.width = width;
                canvas.height = img.height * scaleSize;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                let dataURLBase64 = ctx.canvas.toDataURL(img, 'image/jpeg'),
                    arr = dataURLBase64.split(','),
                    mime = arr[0].match(/:(.*?);/)[1],
                    bstr = window.atob(arr[1]),
                    n = bstr.length,
                    u8arr = new Uint8Array(n);

                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }

                const newFile = new File([u8arr], file.name, { type: mime });

                resolve(newFile);

                /**
                 * Download the file
                 * un comment this to check the file image
                 */

                // const link = document.createElement('a');
                // link.href = URL.createObjectURL(newFile);
                // link.download = newFile.name;
                // link.click();
                // URL.revokeObjectURL(link.href);
            };

            img.onerror = (error) => {
                reject(error);
            };
        };

        reader.readAsDataURL(file);
    });
};
