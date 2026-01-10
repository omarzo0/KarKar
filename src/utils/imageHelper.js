const formatImageUrl = (req, imagePath) => {
    if (!imagePath) return null;

    // If it's already a full URL, return it
    if (imagePath.startsWith("http")) {
        return imagePath;
    }

    // Get protocol and host
    const protocol = req.protocol;
    const host = req.get("host");

    // Ensure we don't have double slashes
    const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

    return `${protocol}://${host}/${cleanPath}`;
};

const formatImageArray = (req, imageArray) => {
    if (!Array.isArray(imageArray)) return [];
    return imageArray.map(img => formatImageUrl(req, img)).filter(img => img !== null);
};

/**
 * Strips the base URL from an image path to store only the relative path in DB
 */
const stripBaseUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's a full URL, attempt to strip protocol and host
    if (imagePath.startsWith("http")) {
        try {
            const url = new URL(imagePath);
            // We want everything after the host (e.g., uploads/image.jpg)
            let path = url.pathname;
            // Remove leading slash
            if (path.startsWith("/")) {
                path = path.slice(1);
            }
            return path;
        } catch (e) {
            return imagePath;
        }
    }

    return imagePath;
};

const stripImageArray = (imageArray) => {
    if (typeof imageArray === "string") {
        return [stripBaseUrl(imageArray)].filter(img => img !== null);
    }
    if (!Array.isArray(imageArray)) return [];
    return imageArray.map(img => stripBaseUrl(img)).filter(img => img !== null);
};

module.exports = {
    formatImageUrl,
    formatImageArray,
    stripBaseUrl,
    stripImageArray
};
