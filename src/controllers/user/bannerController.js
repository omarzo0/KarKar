const Banner = require("../../models/Banner");
const { formatImageUrl } = require("../../utils/imageHelper");

// Get active banners for home page
const getBanners = async (req, res) => {
  try {
    const { position } = req.query;

    const now = new Date();

    const query = {
      isActive: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: null },
        { startDate: { $lte: now }, endDate: { $gte: now } },
      ],
    };

    if (position) {
      query.position = position;
    }

    const banners = await Banner.find(query)
      .select(
        "title subtitle image mobileImage link linkType linkTarget buttonText position order backgroundColor textColor"
      )
      .sort({ position: 1, order: 1 });

    // Group banners by position
    const groupedBanners = {
      hero: [],
      secondary: [],
      promotional: [],
    };

    banners.forEach((banner) => {
      const formattedBanner = {
        ...banner.toObject(),
        image: formatImageUrl(req, banner.image),
        mobileImage: formatImageUrl(req, banner.mobileImage)
      };
      if (groupedBanners[banner.position]) {
        groupedBanners[banner.position].push(formattedBanner);
      }
    });

    res.status(200).json({
      success: true,
      data: position ? banners.map(b => ({
        ...b.toObject(),
        image: formatImageUrl(req, b.image),
        mobileImage: formatImageUrl(req, b.mobileImage)
      })) : groupedBanners,
    });
  } catch (error) {
    console.error("Get banners error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: error.message,
    });
  }
};

// Get single banner by ID (for banner detail/click tracking)
const getBannerById = async (req, res) => {
  try {
    const { bannerId } = req.params;

    const now = new Date();

    const banner = await Banner.findOne({
      _id: bannerId,
      isActive: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: null },
        { startDate: { $lte: now }, endDate: { $gte: now } },
      ],
    }).select(
      "title subtitle image mobileImage link linkType linkTarget buttonText position backgroundColor textColor"
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found or not available",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...banner.toObject(),
        image: formatImageUrl(req, banner.image),
        mobileImage: formatImageUrl(req, banner.mobileImage)
      },
    });
  } catch (error) {
    console.error("Get banner by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banner",
      error: error.message,
    });
  }
};

module.exports = {
  getBanners,
  getBannerById,
};
