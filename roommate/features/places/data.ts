import type { Place } from "./types";

// Starter data for the San Jose/SJSU prototype. Validate this data with a
// geocoding/map provider before calling it production-ready.
export const places: Place[] = [
  { id: "sjsu", name: "San José State University", category: "Campus", coordinates: { latitude: 37.3352, longitude: -121.8811 }, description: "Main campus" },
  { id: "adobe", name: "Adobe San Jose", category: "Company", coordinates: { latitude: 37.3269, longitude: -121.8926 }, description: "Downtown office campus" },
  { id: "paypal", name: "PayPal San Jose", category: "Company", coordinates: { latitude: 37.3746, longitude: -121.9227 }, description: "North San Jose office" },
  { id: "mlk", name: "Dr. Martin Luther King, Jr. Library", category: "Library", coordinates: { latitude: 37.3355, longitude: -121.8853 }, description: "SJSU and city library" },
  { id: "safeway", name: "Safeway", category: "Groceries", coordinates: { latitude: 37.3387, longitude: -121.8879 }, description: "Downtown grocery option" },
  { id: "trader-joes", name: "Trader Joe's", category: "Groceries", coordinates: { latitude: 37.3231, longitude: -121.9296 }, description: "Nearby grocery option" },
];
