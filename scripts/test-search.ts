import "dotenv/config";
import dbConnect from "../src/lib/db";
import Movie from "../src/models/Movie";

async function testSearch() {
  console.log("Testing Search Functionality...");
  await dbConnect();

  try {
    // Test 1: Search for "Inception"
    const inceptionContext = await Movie.find({ title: { $regex: "Inception", $options: "i" } });
    console.log(`Search "Inception": Found ${inceptionContext.length} movies.`);
    if (inceptionContext.length > 0 && inceptionContext[0].title === "Inception") {
        console.log("✅ exact match found");
    } else {
        console.log("❌ exact match failed");
    }

    // Test 2: Search for "The"
    const theContext = await Movie.find({ title: { $regex: "The", $options: "i" } });
    console.log(`Search "The": Found ${theContext.length} movies.`);
    if (theContext.length >= 3) { // Dark Knight, Matrix, Way of Water, etc.
         console.log("✅ partial match found multiple");
    } else {
         console.log("❌ partial match failed (expected multiple)");
    }

    // Test 3: Search for non-existent
    const noneContext = await Movie.find({ title: { $regex: "Xylophone", $options: "i" } });
    console.log(`Search "Xylophone": Found ${noneContext.length} movies.`);
    if (noneContext.length === 0) {
        console.log("✅ no match correct");
    } else {
        console.log("❌ no match failed (expected 0)");
    }
    
  } catch (error) {
    console.error("❌ Search test failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

testSearch();
