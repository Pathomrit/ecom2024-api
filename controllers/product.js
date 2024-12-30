const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_KEY_SECRET, // Click 'View API Keys' above to copy your API secret
});

exports.create = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;
    // console.log(title, description, price, quantity, categoryId, images);
    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    res.send(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Servers Error" });
  }
};

exports.list = async (req, res) => {
  try {
    const { count } = req.params;
    // console.log(count);
    const products = await prisma.product.findMany({
      take: parseInt(count),
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.read = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params; // console.log(id);
    const { title, description, price, quantity, categoryId, images } =
      req.body;
    //clear images
    await prisma.image.deleteMany({
      where: {
        productId: Number(id),
      },
    });
    const productUpdate = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    res.send(productUpdate);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);

    // Step 1 Search Product Include Images
    const product = await prisma.product.findFirst({
      where: { id: Number(id) },
      include: {
        images: true,
      },
    });
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }
    console.log(product);

    // Step 2 Promise (Wait Delete Image in cloudinary)
    const deletedImage = product.images.map(
      (item, index) =>
        new Promise((resolve, reject) => {
          // Delete form cloudinary
          cloudinary.uploader.destroy(item.public_id, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        })
    );
    await Promise.all(deletedImage);

    // Step 3 Delete Product
    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });
    res.send("Delete Success");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.listBy = async (req, res) => {
  try {
    const { sort, order, limit } = req.body;
    // console.log(sort, order, limit);
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { [sort]: order },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const handleQuery = async (req, res, query) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).send("Search Error");
  }
};

const handlePrice = async (req, res, priceRange) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0],
          lte: priceRange[1],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const handleCategory = async (req, res, categoryId) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId.map((item) => Number(item)),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.searchFilters = async (req, res) => {
  try {
    const { query, category, price } = req.body;
    if (query) {
      await handleQuery(req, res, query);
      console.log("has query >", query);
    }
    if (category) {
      await handleCategory(req, res, category);
      console.log("has category >", category);
    }
    if (price) {
      await handlePrice(req, res, price);
      console.log("has price >", price);
    }
    // res.send("Hello search Filters product");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createImages = async (req, res) => {
  try {
    // console.log(req.body);
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `Captain-${Date.now()}`,
      resource_type: "auto",
      folder: "Ecom2024",
    });
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.removeImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    // console.log(public_id);
    cloudinary.uploader.destroy(public_id, (result) => {
      res.send("Remove image success");
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
