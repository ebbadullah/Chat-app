// Cloudinary configuration and utility functions
const CLOUDINARY_CLOUD_NAME = "dfnpekedc"; // Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = "chat-app"; // Replace with your upload preset

// Function to upload image to Cloudinary
export const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error("Upload failed");
    }
    
    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

// Function to create a Cloudinary URL with transformations
export const getCloudinaryUrl = (publicId, transformations = {}) => {
  const { width, height, crop = "fill", quality = "auto:best" } = transformations;
  
  let url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  // Add transformations if provided
  if (width || height) {
    url += `/c_${crop}`;
    if (width) url += `,w_${width}`;
    if (height) url += `,h_${height}`;
  }

  // Add quality transformation
  url += `,q_${quality}/${publicId}`;

  return url;
};
