import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { getProducts, adminDeleteProduct } from "@/services/api";
import ProductForm from "./ProductForm";
import ConfirmDialog from "@/components/ConfirmDialog";

const ProductsTab = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Erro a carregar produtos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const confirmDelete = async () => {
    const id = pendingDelete?.id;
    setPendingDelete(null);
    if (!id) return;
    try {
      await adminDeleteProduct(token, id);
      toast.success("Produto eliminado.");
      fetchProducts();
    } catch (err) {
      toast.error("Erro ao eliminar produto");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <p className="mt-4 text-gray-600">A carregar...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h2 className="text-xl font-syne font-bold">
          Produtos ({products.length})
        </h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowProductForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          data-testid="add-product-button"
        >
          <Plus size={20} />
          <span>ADICIONAR PRODUTO</span>
        </button>
      </div>

      {showProductForm ? (
        <ProductForm
          product={editingProduct}
          token={token}
          onSave={() => {
            setShowProductForm(false);
            setEditingProduct(null);
            fetchProducts();
          }}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {product.images && product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.title_pt}
                  className="w-20 h-20 object-cover rounded shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{product.title_pt}</h3>
                <p className="text-sm text-gray-600">
                  {product.category}
                  {product.subcategory ? ` · ${product.subcategory}` : ""}
                </p>
                <p className="text-accent font-bold mt-1">
                  €{Number(product.price || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2 self-start sm:self-center">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setShowProductForm(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Editar"
                  aria-label="Editar produto"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() =>
                    setPendingDelete({ id: product.id, name: product.title_pt })
                  }
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Eliminar"
                  aria-label="Eliminar produto"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-gray-500 italic">Sem produtos para mostrar.</p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Eliminar produto"
        message={`Tens a certeza que queres eliminar "${pendingDelete?.name || ""}"? Esta acção não pode ser anulada.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default ProductsTab;
