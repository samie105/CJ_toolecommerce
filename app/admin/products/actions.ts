'use server';

export async function uploadToCloudinary(base64Data: string): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!base64Data) {
    return { success: false, error: 'No file provided' };
  }

  try {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', base64Data);
    cloudinaryFormData.append('upload_preset', 'my_preset');

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dgqjunu7l/upload',
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error response:', errorData);
      return { success: false, error: errorData.error?.message || 'Upload failed' };
    }

    const data = await response.json();
    return { success: true, url: data.secure_url };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { success: false, error: 'Failed to upload image' };
  }
}

export async function uploadMultipleToCloudinary(base64Files: { data: string; name: string }[]): Promise<{ success: boolean; urls?: string[]; error?: string }> {
  if (!base64Files || base64Files.length === 0) {
    return { success: false, error: 'No files provided' };
  }

  try {
    const uploadPromises = base64Files.map(async (file) => {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file.data);
      cloudinaryFormData.append('upload_preset', 'my_preset');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dgqjunu7l/upload',
        {
          method: 'POST',
          body: cloudinaryFormData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    });

    const urls = await Promise.all(uploadPromises);
    return { success: true, urls };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { success: false, error: 'Failed to upload images' };
  }
}
