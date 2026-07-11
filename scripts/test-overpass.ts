import { geocode, getResources } from "../lib/repository";

async function main() {
  console.log("Testing geocode for Bengaluru...");
  try {
    const coords = await geocode("Bengaluru");
    console.log("Geocode result:", coords);
    
    const res = await getResources("Bengaluru");
    console.log(`Successfully fetched ${res.length} resources`);
  } catch (error) {
    console.error("Error in test-overpass:", error);
  }
}

main();
