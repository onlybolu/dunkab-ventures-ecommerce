import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbconnect";
import Product from "../../../../models/product";

const toNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const parseCategoryFilter = (categoryRaw) => {
  if (!categoryRaw || categoryRaw === "all") return null;

  try {
    const parsed = JSON.parse(categoryRaw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // non-JSON category is handled below
  }

  return categoryRaw;
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("q") || "").trim();
    const categoryRaw = (searchParams.get("category") || "").trim();
    const category = parseCategoryFilter(categoryRaw);
    const minRaw = searchParams.get("minPrice");
    const maxRaw = searchParams.get("maxPrice");
    const hasPriceFilter = minRaw !== null || maxRaw !== null;
    const min = Math.max(0, toNumber(minRaw, 0));
    const max = Math.max(min, toNumber(maxRaw, 99999999));
    const page = Math.max(1, Math.floor(toNumber(searchParams.get("page"), 1)));
    const limit = Math.min(48, Math.max(1, Math.floor(toNumber(searchParams.get("limit"), 12))));

    const query = {};

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { category: { $regex: safeSearch, $options: "i" } },
        { brand: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (category) {
      query.category =
        typeof category === "string"
          ? { $regex: `^${escapeRegex(category)}$`, $options: "i" }
          : category;
    }

    let products = [];
    let totalProducts = 0;

    if (hasPriceFilter) {
      const numericPriceExpr = {
        $convert: {
          input: {
            $replaceAll: {
              input: {
                $replaceAll: {
                  input: {
                    $replaceAll: {
                      input: { $ifNull: ["$price", "0"] },
                      find: "₦",
                      replacement: "",
                    },
                  },
                  find: ",",
                  replacement: "",
                },
              },
              find: " ",
              replacement: "",
            },
          },
          to: "double",
          onError: 0,
          onNull: 0,
        },
      };

      const pipeline = [
        { $match: query },
        { $addFields: { numericPrice: numericPriceExpr } },
        { $match: { numericPrice: { $gte: min, $lte: max } } },
        { $sort: { createdAt: -1 } },
      ];

      const [countResult, pageRows] = await Promise.all([
        Product.aggregate([...pipeline, { $count: "total" }]),
        Product.aggregate([
          ...pipeline,
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $project: { numericPrice: 0 } },
        ]),
      ]);

      totalProducts = countResult?.[0]?.total || 0;
      products = pageRows;
    } else {
      [products, totalProducts] = await Promise.all([
        Product.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Product.countDocuments(query),
      ]);
    }

    return NextResponse.json(
      {
        products,
        totalPages: Math.max(1, Math.ceil(totalProducts / limit)),
        totalProducts,
        page,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
