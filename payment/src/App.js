import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
const fetchOrder = async () => {
  try {
    const data = await axios.get("http://localhost:8080/list-order");
    console.log(data);
  } catch (er) {
    console.log(er.message);
  }
};

function App() {
  const [order, setOrder] = useState();
  const [orderAmount, setOrderAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrder()
      .then((res) => {
        console.log(res);
      })
      .catch((er) => console.log(er.message));
  }, []);
  const handlePay = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onerror = () => {
      alert("RazorPay SDK failed to load");
    };
    script.onload = async () => {
      try {
        setLoading(true);
        const result = await axios.post("http://localhost:8080/create-order", {
          amount: 100 + "",
        });

        const { amount, id: orderId, currency } = result.data.order;
        console.log(result.data, "from handle pay ");

        const getkey = await axios.get(
          "http://localhost:8080/get-razorpay-key"
        );
        const key = getkey.data;
        console.log(key.key, "second console inside handlepay");
        const options = {
          key: key.key,
          amount: amount.toString(),
          currency: currency,
          name: "NAYAN KUMAR",
          description: "FIRST RAZOR PAY",
          order_id: orderId,
          handler: async function (response) {
            const result = await axios.post("http://localhost:8080/pay-order", {
              amount: amount,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpay0rderId: response.razorpay_order_id,
              razorpaysighature: response.razorpay_signature,
            });
            alert(result.data.message);
            fetchOrder();
          },
          prefill: {
            name: "Nayan Kumar",
            email: "nayanph1@gmail.com",
            contact: "9481574558",
          },
        };
        setLoading(false);
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (er) {
        alert(er);
        setLoading(false);
      }
    };
    document.body.appendChild(script);
  };
  return (
    <div className="App">
      <h1>RAzorPay Node and React</h1>
      <hr />
      <div>
        <h2>Pay Order</h2>
        <label>Enter Amount</label>
        <input
          type="number"
          placeholder="Enter Amount "
          value={orderAmount}
          onChange={(e) => setOrderAmount(e.target.value)}
        />
        <button onClick={handlePay}>PAY</button>{" "}
        {loading && <h3>...Loading please wait</h3>}
      </div>
    </div>
  );
}

export default App;
