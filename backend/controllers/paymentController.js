const Subscription = require("../models/Subscription");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// 创建支付会话
const createCheckoutSession = async (req, res) => {
  try {
    const { subscriptionType } = req.body;
    const userId = req.user?.id || req.userId;
    // 这里要和前端保持一致
    let priceId;
    if (subscriptionType === "premium") {
      priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    } else if (subscriptionType === "enterprise") {
      priceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;
    } else {
      return res.status(400).json({ message: "无效的会员类型" });
    }

    const oldSub = await Subscription.findOne({
      userId,
      status: "active",
      subscriptionType: "premium",
    });
    if (oldSub && oldSub.paymentId) {
      // 取消 Stripe 端的订阅
      await stripe.subscriptions.update(oldSub.paymentId, {
        cancel_at_period_end: true,
      });
      // 或者立即取消：await stripe.subscriptions.del(oldSub.paymentId);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        userId,
        subscriptionType,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("创建支付会话失败:", error);
    res.status(500).json({ message: "创建支付会话失败" });
  }
};

// 处理支付成功webhook
const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("收到 webhook:", event.type, event.data.object);
  } catch (err) {
    console.error("Webhook 签名校验失败:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const subscriptionType = session.metadata.subscriptionType;
    console.log(
      "checkout.session.completed, userId:",
      userId,
      "subscriptionType:",
      subscriptionType
    );

    // 1. 先取消所有 active 订阅（不管类型）
    await Subscription.updateMany(
      { userId, status: "active" },
      { $set: { status: "cancelled", endDate: new Date() } }
    );

    // 2. 再插入新订阅
    if (session.subscription) {
      const stripeSub = await stripe.subscriptions.retrieve(
        session.subscription
      );
      console.log("session.subscription:", session.subscription);
      await Subscription.create({
        userId,
        subscriptionType,
        status: "active",
        startDate: new Date(),
        endDate:
          stripeSub && stripeSub.current_period_end
            ? new Date(stripeSub.current_period_end * 1000)
            : new Date(),
        paymentId: session.subscription || session.id,
        features: {
          gpt3_5:
            subscriptionType === "premium" || subscriptionType === "enterprise",
          gpt4o: subscriptionType === "enterprise",
          claude: subscriptionType === "enterprise",
        },
      });
    } else {
      // fallback，防止崩溃
      await Subscription.create({
        userId,
        subscriptionType,
        status: "active",
        startDate: new Date(),
        endDate: new Date(),
        paymentId: session.id,
        features: {
          gpt3_5:
            subscriptionType === "premium" || subscriptionType === "enterprise",
          gpt4o: subscriptionType === "enterprise",
          claude: subscriptionType === "enterprise",
        },
      });
    }

    // 3. 你可以加日志或其他后续处理
  }

  res.json({ received: true });
};

// 获取用户订阅状态
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const priority = { enterprise: 3, premium: 2, free: 1 };
    const subs = await Subscription.find({ userId, status: "active" });
    const current = subs.sort(
      (a, b) => priority[b.subscriptionType] - priority[a.subscriptionType]
    )[0];
    res.json({ data: current });
  } catch (error) {
    console.error("获取订阅状态失败:", error);
    res.status(500).json({ message: "获取订阅状态失败" });
  }
};

// 取消 Stripe 订阅
const cancelStripeSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    // 查找当前 active 订阅
    const sub = await Subscription.findOne({ userId, status: "active" });
    if (!sub || !sub.paymentId) {
      return res.status(400).json({ message: "未找到有效订阅" });
    }
    // 取消 Stripe 订阅（本周期结束后取消）
    await stripe.subscriptions.update(sub.paymentId, {
      cancel_at_period_end: true,
    });
    // 你也可以选择立即取消：await stripe.subscriptions.del(sub.paymentId);

    // 立即同步数据库（可选，推荐等 Stripe webhook 通知后再同步）
    sub.status = "cancelled";
    sub.endDate = new Date();
    await sub.save();

    res.json({ success: true, message: "订阅已取消，将在本周期结束后失效" });
  } catch (error) {
    console.error("取消订阅失败:", error);
    res.status(500).json({ message: "取消订阅失败" });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelStripeSubscription,
};
