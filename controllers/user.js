const prisma = require("../config/prisma");

exports.getAllUser = async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enabled: true,
        address: true,
      },
    });
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const { id, enabled } = req.body;
    console.log(id, enabled);

    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        enabled: enabled,
      },
    });
    res.send("Update Status Success");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { id, role } = req.body;
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        role: role,
      },
    });
    res.send("Update  role success");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error " });
  }
};

exports.userCart = async (req, res) => {
  try {
    const { cart } = req.body;
    console.log(cart);
    console.log(req.user.id);
    const user = await prisma.user.findFirst({
      where: {
        id: Number(req.user.id),
      },
    });
    // console.log(user);

    // Check cart quantity
    for (const item of cart) {
      const product = await prisma.product.findUnique({
        where: {
          id: item.id,
        },
        select: {
          quantity: true,
          title: true,
        },
      });
      // console.log(item);
      // console.log(product);
      if (!product || item.count > product.quantity) {
        return res.status(400).json({
          ok: false,
          message: `No quantity : ${product?.title || "product"} empty`,
        });
      }
    }

    //Delete old cart
    await prisma.productOnCart.deleteMany({
      where: {
        cart: { orderedById: user.id },
      },
    });

    //Delete old cart item
    await prisma.cart.deleteMany({
      where: {
        orderedById: user.id,
      },
    });

    //Prepare Product
    let products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price,
    }));
    console.log(products);

    //Find sum
    let cartTotal = products.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );
    console.log(cartTotal);

    //New Cart
    const newCart = await prisma.cart.create({
      data: {
        products: { create: products },
        cartTotal: cartTotal,
        orderedById: user.id,
      },
    });
    console.log(newCart);
    res.send("Add cart Ok");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    // console.log(cart);
    res.json({
      products: cart.products,
      cartTotal: cart.cartTotal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.removeUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { orderedById: Number(req.user.id) },
    });
    if (!cart) {
      return res.status(400).json({ message: "No Cart" });
    }
    await prisma.productOnCart.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
    const result = await prisma.cart.deleteMany({
      where: {
        orderedById: Number(req.user.id),
      },
    });
    console.log(result);
    res.json({ message: "Cart emtry success", deletedCount: result.count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.addressUserCart = async (req, res) => {
  try {
    const { address } = req.body;
    console.log(address);
    const addressUser = await prisma.user.update({
      where: {
        id: Number(req.user.id),
      },
      data: {
        address: address,
      },
    });
    res.json({ ok: true, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.order = async (req, res) => {
  try {
    // Check Stripe

    // console.log(req.body);
    // return res.send("Hello Payload");
    // Get user cart

    const { id, amount, status, currency } = req.body.paymentIntent;

    const userCart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: true,
      },
    });

    // Check cart empty
    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({ ok: false, message: "Cart is empty" });
    }

    // Check cart quantity
    // for (const item of userCart.products) {
    //   const product = await prisma.product.findUnique({
    //     where: {
    //       id: item.productId,
    //     },
    //     select: {
    //       quantity: true,
    //       title: true,
    //     },
    //   });
    //   // console.log(item);
    //   // console.log(product);
    //   if (!product || item.count > product.quantity) {
    //     return res.status(400).json({
    //       ok: false,
    //       message: `No quantity : ${product?.title || "product"} empty`,
    //     });
    //   }
    // }
    const amountTHB = Number(amount) / 100;

    // Create new order
    const order = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,
            count: item.count,
            price: item.price,
          })),
        },
        orderedBy: {
          connect: { id: req.user.id },
        },
        cartTotal: userCart.cartTotal,
        stripePaymentId: id,
        amount: amountTHB,
        status: status,
        currency: currency,
      },
    });
    // console.log(order);

    // Update Product
    const update = userCart.products.map((item) => ({
      where: {
        id: item.productId,
      },
      data: {
        quantity: { decrement: item.count },
        sold: { increment: item.count },
      },
    }));
    console.log(update);

    await Promise.all(update.map((item) => prisma.product.update(item)));

    // Delete Product
    await prisma.cart.deleteMany({
      where: {
        orderedById: Number(req.user.id),
      },
    });

    res.json({ ok: true, order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!orders || orders.length === 0) {
      return res.status(400).json({ ok: false, message: "No orders" });
    }
    // console.log(orders);
    res.json({ ok: true, orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
