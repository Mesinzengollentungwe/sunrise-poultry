import { Router } from "express";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { db } from "../db.js";

const router = Router();

const DEMO_MODE =
  !process.env.MOMO_SUBSCRIPTION_KEY && !process.env.ORANGE_CLIENT_ID;

async function getOrder(orderId) {
  await db.read();
  return db.data.orders.find((o) => o.id === orderId);
}

async function saveOrder(order) {
  await db.read();
  const idx = db.data.orders.findIndex((o) => o.id === order.id);
  db.data.orders[idx] = order;
  await db.write();
}

/* ------------------------------------------------------------------ */
/*  MTN MOBILE MONEY (MoMo) — Collections "Request to Pay"             */
/*  Docs: https://momodeveloper.mtn.com                                */
/* ------------------------------------------------------------------ */

async function getMomoAccessToken() {
  const basicAuth = Buffer.from(
    `${process.env.MOMO_API_USER}:${process.env.MOMO_API_KEY}`
  ).toString("base64");

  const { data } = await axios.post(
    `${process.env.MOMO_BASE_URL}/collection/token/`,
    {},
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY
      }
    }
  );
  return data.access_token;
}

router.post("/momo/initiate", async (req, res) => {
  const { orderId, phone } = req.body;
  const order = await getOrder(orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (!phone) return res.status(400).json({ error: "MoMo phone number is required" });

  const referenceId = uuid();

  try {
    if (DEMO_MODE) {
      // No live credentials configured — simulate a successful request-to-pay
      // so the flow can be tested end-to-end. Swap this block out once
      // MOMO_* variables are set in backend/.env
      order.status = "processing_payment";
      order.paymentMethod = "momo";
      order.paymentReference = referenceId;
      await saveOrder(order);

      setTimeout(async () => {
        const fresh = await getOrder(orderId);
        fresh.status = "paid";
        await saveOrder(fresh);
      }, 4000);

      return res.json({
        status: "processing_payment",
        referenceId,
        demo: true,
        message: "Demo mode: simulating MTN MoMo prompt. Configure MOMO_* in .env for live payments."
      });
    }

    const token = await getMomoAccessToken();

    await axios.post(
      `${process.env.MOMO_BASE_URL}/collection/v1_0/requesttopay`,
      {
        amount: String(order.total),
        currency: "XAF",
        externalId: order.reference,
        payer: { partyIdType: "MSISDN", partyId: phone },
        payerMessage: `Payment for Sun Rise Poultry order ${order.reference}`,
        payeeNote: "Sun Rise Poultry Enterprise"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": process.env.MOMO_TARGET_ENVIRONMENT,
          "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    order.status = "processing_payment";
    order.paymentMethod = "momo";
    order.paymentReference = referenceId;
    await saveOrder(order);

    res.json({ status: "processing_payment", referenceId });
  } catch (err) {
    console.error("MoMo initiate error:", err.response?.data || err.message);
    res.status(502).json({ error: "Could not reach MTN MoMo. Please try again." });
  }
});

// MTN calls this once the customer approves/rejects the prompt on their phone
router.put("/momo/webhook", async (req, res) => {
  const { referenceId, status } = req.body; // shape depends on your MTN callback config
  await db.read();
  const order = db.data.orders.find((o) => o.paymentReference === referenceId);
  if (order) {
    order.status = status === "SUCCESSFUL" ? "paid" : "payment_failed";
    await saveOrder(order);
  }
  res.sendStatus(200);
});

/* ------------------------------------------------------------------ */
/*  ORANGE MONEY (Cameroon) — Web Payment API                          */
/*  Docs: https://developer.orange.com/apis/om-webpay                  */
/* ------------------------------------------------------------------ */

async function getOrangeAccessToken() {
  const basicAuth = Buffer.from(
    `${process.env.ORANGE_CLIENT_ID}:${process.env.ORANGE_CLIENT_SECRET}`
  ).toString("base64");

  const { data } = await axios.post(
    `${process.env.ORANGE_BASE_URL}/oauth/v3/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
  return data.access_token;
}

router.post("/orange/initiate", async (req, res) => {
  const { orderId } = req.body;
  const order = await getOrder(orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const referenceId = uuid();

  try {
    if (DEMO_MODE) {
      order.status = "processing_payment";
      order.paymentMethod = "orange";
      order.paymentReference = referenceId;
      await saveOrder(order);

      return res.json({
        status: "processing_payment",
        referenceId,
        demo: true,
        payment_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/order-confirmation?orderId=${orderId}&demoPay=orange`,
        message: "Demo mode: simulating Orange Money Web Payment redirect. Configure ORANGE_* in .env for live payments."
      });
    }

    const token = await getOrangeAccessToken();

    const { data } = await axios.post(
      `${process.env.ORANGE_BASE_URL}/orange-money-webpay/cm/v1/webpayment`,
      {
        merchant_key: process.env.ORANGE_MERCHANT_KEY,
        currency: "XAF",
        order_id: order.reference,
        amount: order.total,
        return_url: process.env.ORANGE_RETURN_URL,
        cancel_url: process.env.ORANGE_CANCEL_URL,
        notif_url: process.env.ORANGE_NOTIF_URL,
        lang: "fr",
        reference: referenceId
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    order.status = "processing_payment";
    order.paymentMethod = "orange";
    order.paymentReference = referenceId;
    await saveOrder(order);

    res.json({ status: "processing_payment", referenceId, payment_url: data.payment_url });
  } catch (err) {
    console.error("Orange Money initiate error:", err.response?.data || err.message);
    res.status(502).json({ error: "Could not reach Orange Money. Please try again." });
  }
});

// Orange calls this after the customer completes/cancels payment on their page
router.post("/orange/webhook", async (req, res) => {
  const { reference, status } = req.body; // shape depends on Orange's notif payload
  await db.read();
  const order = db.data.orders.find((o) => o.paymentReference === reference);
  if (order) {
    order.status = status === "SUCCESS" ? "paid" : "payment_failed";
    await saveOrder(order);
  }
  res.sendStatus(200);
});

/* ------------------------------------------------------------------ */
/*  Shared: poll payment status from the frontend                      */
/* ------------------------------------------------------------------ */

router.get("/status/:orderId", async (req, res) => {
  const order = await getOrder(req.params.orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ status: order.status, paymentMethod: order.paymentMethod });
});

export default router;
