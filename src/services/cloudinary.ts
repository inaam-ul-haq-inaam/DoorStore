export const CLOUDINARY_CLOUD_NAME = 'fymkvymu';
export const CLOUDINARY_UPLOAD_PRESET = 'doorStore';

export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadImageToCloudinary = async (base64Image: string): Promise<string> => {
  const data = new FormData();
  // Send the image as a Data URI string instead of a local file object
  // This bypasses all React Native file system reading bugs
  data.append('file', `data:image/jpeg;base64,${base64Image}`);
  data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: data,
    });

    const result = await response.json();
    if (result.secure_url) {
      return result.secure_url; // This is the live public URL
    } else {
      console.error('Cloudinary Error:', result);
      throw new Error(result.error?.message || 'Cloudinary returned an error');
    }
  } catch (error: any) {
    console.error('Fetch Error:', error);
    throw new Error(error.message || 'Network request failed in Cloudinary Fetch.');
  }
};
