const Subscription = require("../models/Subscription");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");

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
      subscription_data: {
        metadata: {
          userId,
          subscriptionType,
        },
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
  console.log("收到 webhook 请求，签名:", sig);
  console.log("Webhook Secret:", process.env.STRIPE_WEBHOOK_SECRET);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("Webhook 事件类型:", event.type);
    console.log(
      "Webhook 事件数据:",
      JSON.stringify(event.data.object, null, 2)
    );
  } catch (err) {
    console.error("Webhook 签名校验失败:", err.message);
    console.error("错误详情:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 处理结账会话完成事件
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const subscriptionType = session.metadata.subscriptionType;
    const subscriptionId = session.subscription;

    console.log(
      "处理支付成功，用户ID:",
      userId,
      "订阅类型:",
      subscriptionType,
      "订阅ID:",
      subscriptionId
    );

    try {
      // 1. 先取消所有 active 订阅（不管类型）
      const updateResult = await Subscription.updateMany(
        { userId, status: "active" },
        { $set: { status: "cancelled", endDate: new Date() } }
      );
      console.log("取消旧订阅结果:", updateResult);

      // 2. 创建新订阅
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 默认一个月
      console.log("订阅结束时间:", endDate);

      const newSubscription = await Subscription.create({
        userId,
        subscriptionType,
        status: "active",
        startDate: new Date(),
        endDate: endDate,
        paymentId: subscriptionId,
        features: {
          gpt3_5:
            subscriptionType === "premium" || subscriptionType === "enterprise",
          gpt4o: subscriptionType === "enterprise",
          claude: subscriptionType === "enterprise",
        },
      });
      console.log("创建新订阅成功:", newSubscription._id);

      // 3. 更新用户状态和订阅ID
      const user = await User.findById(userId);
      if (user) {
        user.subscriptionStatus = subscriptionType;
        user.activeSubscription = newSubscription._id;
        await user.save();
        console.log("更新用户订阅状态成功:", user.subscriptionStatus);
      } else {
        console.error("未找到用户:", userId);
      }
    } catch (error) {
      console.error("处理订阅时出错:", error);
      console.error("错误堆栈:", error.stack);
    }
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

    // 更新用户表中的订阅状态和订阅ID
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: "free",
      activeSubscription: null,
    });

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
