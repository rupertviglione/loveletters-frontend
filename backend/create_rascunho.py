import requests
import json

API_URL = "http://localhost:8001/api"

# Criar produto de teste para Rascunhos
rascunho_product = {
    "title_pt": "T-shirt Love - Rascunho",
    "title_en": "Love T-shirt - Draft",
    "description_pt": "T-shirt com pequena imperfeição no tecido. Mensagem de amor intacta e bonita. Preço reduzido para dar uma segunda oportunidade a esta peça especial.",
    "description_en": "T-shirt with minor fabric imperfection. Love message intact and beautiful. Reduced price to give this special piece a second chance.",
    "category": "rascunhos",
    "price": 12.50,
    "original_price": 25.00,
    "variants": {
        "sizes": ["S", "M", "L"],
        "colors": ["white", "black"]
    },
    "images": [
        "/img/t-shirt-love.jpg",
        "/img/photo-2.jpg"
    ]
}

try:
    response = requests.post(f"{API_URL}/products", json=rascunho_product)
    if response.status_code == 200:
        print("✅ Produto Rascunho criado com sucesso!")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"❌ Erro: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"❌ Erro ao criar produto: {e}")
