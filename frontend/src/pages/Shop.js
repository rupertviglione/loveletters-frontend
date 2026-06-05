import React, { useState, useEffect } from "react";
import { getProducts } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

const categories = [
  { id: "tshirts", pt: "T-shirts", en: "T-shirts" },
  { id: "totebags", pt: "Tote Bags", en: "Tote Bags" },
  { id: "posters", pt: "Posters", en: "Posters" },
  { id: "complementos", pt: "Complementos", en: "Accessories" },
  { id: "bundles", pt: "Conjuntos", en: "Bundles" },
  { id: "rascunhos", pt: "Rascunhos", en: "Drafts" },
];

const collectionFilters = [
  { id: "o-poema-e-tu", pt: "O poema e tu", en: "O poema e tu" },
  { id: "era-uma-vez", pt: "Era uma vez", en: "Era uma vez" },
  {
    id: "write-that-love-letter",
    pt: "Write that love letter",
    en: "Write that love letter",
  },
  { id: "dare-to", pt: "Dare to", en: "Dare to" },
];

const collectionImageIds = {
  "o-poema-e-tu": "1S0mr3B1jhCGon9DJwp14yfRKFz6NVyFN",
  "era-uma-vez": "10FF_vCtUYFF5UT25A1sF65nUL4YAS6Yu",
  "write-that-love-letter": "1nK0rT5zo--1uF5VbzFZuQcqGy_lW_ecY",
  "dare-to": "189Aphnrmx4AnoGA-SqcjIvd9PftbLfS5",
};

const getDriveImageUrl = (fileId) =>
  `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;

const tshirtSubcategoryMatchers = {
  "o-poema-e-tu": ["o poema e tu"],
  "era-uma-vez": ["era uma vez"],
  "write-that-love-letter": ["write that love letter"],
  "dare-to": ["dare to"],
};

const Shop = () => {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("tshirts");
  const [selectedCollection, setSelectedCollection] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await getProducts(selectedCategory);
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    if (!["tshirts", "totebags"].includes(selectedCategory)) {
      setSelectedCollection("");
    }
  }, [selectedCategory]);

  const filteredProducts =
    ["tshirts", "totebags"].includes(selectedCategory) && selectedCollection
      ? products.filter((product) => {
          if (product.subcategory) {
            return product.subcategory === selectedCollection;
          }

          const searchableTitle =
            `${product.title_pt || ""} ${product.title_en || ""}`.toLowerCase();
          const matchers = tshirtSubcategoryMatchers[selectedCollection] || [];
          return matchers.some((matcher) => searchableTitle.includes(matcher));
        })
      : products;

  const shouldShowProductGrid =
    !["tshirts", "totebags"].includes(selectedCategory) ||
    Boolean(selectedCollection);

  return (
    <div
      className="min-h-screen pt-16 md:pt-20 overflow-x-hidden"
      data-testid="shop-page"
    >
      <SEO
        title="Loja"
        description="Descobre a colecção Love Letters. T-shirts, tote bags, posters e complementos com poesia que se veste."
        url="/shop"
      />
      <div className="border-b border-border py-6 md:py-12 px-4 md:px-8 lg:px-12">
        <h1 className="font-syne font-extrabold text-4xl md:text-7xl uppercase tracking-tight leading-none mb-4 md:mb-6">
          {t("LOJA", "SHOP")}
        </h1>
        <p className="font-serif text-base md:text-lg text-muted-foreground italic max-w-2xl">
          {t("Usa o que sentes.", "Wear what you feel.")}
        </p>
      </div>

      {/* Filter buttons - scrollable on mobile but fits better */}
      <div className="border-b border-border py-3 md:py-4 px-4 md:px-8 lg:px-12 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 md:gap-3 flex-wrap md:flex-nowrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 md:px-5 py-1.5 md:py-2 border uppercase tracking-wider md:tracking-widest text-[10px] md:text-xs font-bold transition-all duration-300 whitespace-nowrap hover:scale-[1.02] active:scale-[0.98] ${
                selectedCategory === category.id
                  ? "bg-accent text-white border-accent"
                  : "bg-transparent border-border hover:border-accent hover:text-accent"
              }`}
              data-testid={`category-filter-${category.id}`}
            >
              {language === "pt" ? category.pt : category.en}
            </button>
          ))}
        </div>
      </div>

      {["tshirts", "totebags"].includes(selectedCategory) && (
        <div className="border-b border-border py-3 md:py-4 px-4 md:px-8 lg:px-12 overflow-x-auto scrollbar-hide">
          {!selectedCollection ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {collectionFilters.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => setSelectedCollection(subcategory.id)}
                  className="group text-left"
                  data-testid={`collection-image-${subcategory.id}`}
                >
                  <div className="aspect-[4/5] border border-border overflow-hidden mb-2">
                    <img
                      src={getDriveImageUrl(collectionImageIds[subcategory.id])}
                      alt={language === "pt" ? subcategory.pt : subcategory.en}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="font-bold text-xs md:text-sm uppercase tracking-wider">
                    {language === "pt" ? subcategory.pt : subcategory.en}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setSelectedCollection("")}
              className="px-3 md:px-5 py-1.5 md:py-2 border tracking-wide text-[10px] md:text-xs font-bold transition-all duration-300 whitespace-nowrap hover:scale-[1.02] active:scale-[0.98] bg-transparent border-border hover:border-foreground hover:text-foreground"
              data-testid="collection-back-button"
            >
              {t("← Voltar às colecções", "← Back to collections")}
            </button>
          )}
        </div>
      )}

      {selectedCategory === "rascunhos" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/30 border-b border-border py-4 md:py-6 px-4 md:px-8 lg:px-12"
        >
          <div className="max-w-3xl">
            <h2 className="font-courier font-bold text-base md:text-xl uppercase mb-2 md:mb-3">
              {t("Rascunhos", "Drafts")}
            </h2>
            <p className="font-serif text-sm md:text-base leading-relaxed">
              {t(
                "Produtos com pequenos defeitos que, pela sua história e pela sustentabilidade, ficam aqui disponíveis a preços simbólicos. Cada imperfeição conta uma história — e todas merecem ser amadas.",
                "Products with minor defects that, for their story and sustainability, are available here at symbolic prices. Each imperfection tells a story — and all deserve to be loved.",
              )}
            </p>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : shouldShowProductGrid ? (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 px-4">
          <p className="font-serif text-lg text-muted-foreground italic">
            {t(
              "Escolhe uma colecção para veres os produtos.",
              "Choose a collection to see products.",
            )}
          </p>
        </div>
      )}

      {!loading && shouldShowProductGrid && filteredProducts.length === 0 && (
        <div className="text-center py-24 px-4">
          <p className="font-serif text-xl text-muted-foreground italic">
            {t("Nenhum produto encontrado.", "No products found.")}
          </p>
        </div>
      )}

      {/* NO BANNER in Shop page - removed as requested */}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Shop;
