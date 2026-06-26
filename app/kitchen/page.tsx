"use client";

import { getAllSalesWithDetails } from "@/services/salesService";
import { Sale } from "@/types";
import { handleResponse } from "@/utils/api-helpers";
import { useEffect, useState } from "react";

export default function KitchenPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getAllSalesWithDetails();
      console.log('data:: ', JSON.stringify(data));
      handleResponse(data, setSales);
    } catch (error) {
      console.error("Error loading sales:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h1>HOLA</h1>
    </div>
  );
}
