import { createContext, useState, useCallback } from "react";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([
    { 
      id: "ORD-001", 
      status: "Delivered", 
      origin: "New York, NY", 
      destination: "Los Angeles, CA", 
      weight: 25, 
      date: "Jan 6, 2026", 
      priority: "high", 
      value: 5000,
      tracking: [
        { date: "Jan 6, 2026", time: "10:30 AM", status: "Picked Up", location: "New York, NY" },
        { date: "Jan 7, 2026", time: "3:45 PM", status: "In Transit", location: "Chicago, IL" },
        { date: "Jan 8, 2026", time: "9:15 AM", status: "Out for Delivery", location: "Los Angeles, CA" },
        { date: "Jan 9, 2026", time: "2:00 PM", status: "Delivered", location: "Los Angeles, CA" }
      ]
    },
    { 
      id: "ORD-002", 
      status: "In Transit", 
      origin: "Chicago, IL", 
      destination: "Miami, FL", 
      weight: 40, 
      date: "Jan 8, 2026", 
      priority: "medium", 
      value: 3500,
      tracking: [
        { date: "Jan 8, 2026", time: "8:00 AM", status: "Picked Up", location: "Chicago, IL" },
        { date: "Jan 8, 2026", time: "6:30 PM", status: "In Transit", location: "Nashville, TN" },
        { date: "Jan 9, 2026", time: "10:00 AM", status: "In Transit", location: "Atlanta, GA" }
      ]
    },
    { 
      id: "ORD-003", 
      status: "Pending", 
      origin: "Seattle, WA", 
      destination: "Boston, MA", 
      weight: 15, 
      date: "Jan 9, 2026", 
      priority: "low", 
      value: 2000,
      tracking: [
        { date: "Jan 9, 2026", time: "11:00 AM", status: "Order Received", location: "Seattle, WA" }
      ]
    },
    { 
      id: "ORD-004", 
      status: "In Transit", 
      origin: "Denver, CO", 
      destination: "Phoenix, AZ", 
      weight: 55, 
      date: "Jan 5, 2026", 
      priority: "critical", 
      value: 8500,
      tracking: [
        { date: "Jan 5, 2026", time: "7:00 AM", status: "Picked Up", location: "Denver, CO" },
        { date: "Jan 6, 2026", time: "5:00 PM", status: "In Transit", location: "Colorado Springs, CO" },
        { date: "Jan 7, 2026", time: "10:00 AM", status: "In Transit", location: "Flagstaff, AZ" },
        { date: "Jan 9, 2026", time: "8:30 AM", status: "Out for Delivery", location: "Phoenix, AZ" }
      ]
    },
  ]);

  const addOrder = useCallback((orderData) => {
    const newOrder = {
      id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      status: "Pending",
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      ...orderData,
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, [orders.length]);

  const updateOrder = useCallback((id, updates) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, ...updates } : order))
    );
  }, []);

  const deleteOrder = useCallback((id) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  }, []);

  const getOrderById = useCallback(
    (id) => orders.find((order) => order.id === id),
    [orders]
  );

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, deleteOrder, getOrderById }}>
      {children}
    </OrderContext.Provider>
  );
};
