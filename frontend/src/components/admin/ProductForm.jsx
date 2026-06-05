import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader, Save } from "lucide-react";
import { adminCreateProduct, adminUpdateProduct } from "@/services/api";
import { COLLECTION_SUBCATEGORIES } from "./constants";

/**
 * Product create/edit form. Renders inside the Products tab.
 */
const ProductForm = ({ product, token, onSave, onCancel }) => {
  const [formData, setFormData] = useState(
    product || {
      title_pt: "",
      title_en: "",
      description_pt: "",
      description_en: "",
      category: "tshirts",
      price: 0,
      original_price: null,
      images: [],
      variants: null,
      is_bundle: false,
      bundle_items: null,
      subcategory: "",
    },
  );
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (product) {
        await adminUpdateProduct(token, product.id, formData);
      } else {
        await adminCreateProduct(token, formData);
      }
      toast.success(product ? "Produto actualizado!" : "Produto criado!");
      onSave();
    } catch (err) {
      toast.error("Erro ao guardar produto");
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), imageUrl.trim()],
      });
      setImageUrl("");
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-bold mb-4">
        {product ? "EDITAR PRODUTO" : "NOVO PRODUTO"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Título (PT)</label>
          <input
            type="text"
            value={formData.title_pt}
            onChange={(e) =>
              setFormData({ ...formData, title_pt: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Título (EN)</label>
          <input
            type="text"
            value={formData.title_en}
            onChange={(e) =>
              setFormData({ ...formData, title_en: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Descrição (PT)
          </label>
          <textarea
            value={formData.description_pt}
            onChange={(e) =>
              setFormData({ ...formData, description_pt: e.target.value })
            }
            required
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Descrição (EN)
          </label>
          <textarea
            value={formData.description_en}
            onChange={(e) =>
              setFormData({ ...formData, description_en: e.target.value })
            }
            required
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Categoria</label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value,
                subcategory: ["tshirts", "totebags"].includes(e.target.value)
                  ? formData.subcategory || ""
                  : "",
              })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="tshirts">T-shirts</option>
            <option value="totebags">Tote Bags</option>
            <option value="posters">Posters</option>
            <option value="complementos">Complementos</option>
            <option value="bundles">Conjuntos</option>
            <option value="rascunhos">Rascunhos</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Subcategoria
          </label>
          <select
            value={formData.subcategory || ""}
            onChange={(e) =>
              setFormData({ ...formData, subcategory: e.target.value })
            }
            disabled={!["tshirts", "totebags"].includes(formData.category)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Sem subcategoria</option>
            {COLLECTION_SUBCATEGORIES.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Preço (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Preço Original (€)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.original_price || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                original_price: e.target.value
                  ? parseFloat(e.target.value)
                  : null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Imagens</label>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL da imagem"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            onClick={addImage}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Adicionar
          </button>
        </div>
        {formData.images && formData.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={img}
                  alt=""
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  aria-label="Remover imagem"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-accent text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          data-testid="product-form-save"
        >
          {saving ? (
            <Loader className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? "A GUARDAR..." : "GUARDAR"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          CANCELAR
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
