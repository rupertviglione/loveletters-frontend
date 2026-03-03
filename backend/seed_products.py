import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

products = [
    {
        "id": "tshirt-poem-ls",
        "title_pt": "T-shirt poema manga comprida",
        "title_en": "Long sleeve poem t-shirt",
        "description_pt": "T-shirt com poema impresso. Disponível em branco, preto e vermelho.",
        "description_en": "T-shirt with printed poem. Available in white, black and red.",
        "category": "tshirts",
        "price": 30.00,
        "variants": {
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "colors": ["white", "black", "red"]
        },
        "images": ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "is_bundle": False
    },
    {
        "id": "tshirt-poem-ss",
        "title_pt": "T-shirt poema manga curta",
        "title_en": "Short sleeve poem t-shirt",
        "description_pt": "T-shirt com poema impresso. Disponível em branco, preto e vermelho.",
        "description_en": "T-shirt with printed poem. Available in white, black and red.",
        "category": "tshirts",
        "price": 28.00,
        "variants": {
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "colors": ["white", "black", "red"]
        },
        "images": ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "is_bundle": False
    },
    {
        "id": "tshirt-pocket",
        "title_pt": "T-shirt frase no bolso",
        "title_en": "Pocket phrase t-shirt",
        "description_pt": "T-shirt com frase bordada no bolso. Disponível em branco, preto e vermelho.",
        "description_en": "T-shirt with embroidered pocket phrase. Available in white, black and red.",
        "category": "tshirts",
        "price": 25.00,
        "variants": {
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "colors": ["white", "black", "red"]
        },
        "images": ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "is_bundle": False
    },
    {
        "id": "tshirt-center",
        "title_pt": "T-shirt frase centro",
        "title_en": "Center phrase t-shirt",
        "description_pt": "T-shirt com frase impressa no centro. Disponível em branco, preto e vermelho.",
        "description_en": "T-shirt with printed center phrase. Available in white, black and red.",
        "category": "tshirts",
        "price": 28.00,
        "variants": {
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "colors": ["white", "black", "red"]
        },
        "images": ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "is_bundle": False
    },
    {
        "id": "tshirt-kids",
        "title_pt": "T-shirt de Criança frase no bolso (com pin personalizado)",
        "title_en": "Kids pocket phrase t-shirt (with custom pin)",
        "description_pt": "T-shirt infantil com frase no bolso e pin personalizado incluído.",
        "description_en": "Kids t-shirt with pocket phrase and custom pin included.",
        "category": "tshirts",
        "price": 24.00,
        "variants": {
            "sizes": ["4-6", "6-8", "8-10", "10-12"],
            "colors": ["white", "black", "red"]
        },
        "images": ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "is_bundle": False
    },
    {
        "id": "tote-structured",
        "title_pt": "Tote bag estruturada",
        "title_en": "Structured tote bag",
        "description_pt": "Modelo estruturado. Disponível em branco, preto, cru e vermelho.",
        "description_en": "Structured model. Available in white, black, beige and red.",
        "category": "totebags",
        "price": 19.00,
        "variants": {
            "colors": ["white", "black", "beige", "red"]
        },
        "images": ["https://images.pexels.com/photos/9869067/pexels-photo-9869067.jpeg"],
        "is_bundle": False
    },
    {
        "id": "tote-light",
        "title_pt": "Tote bag light",
        "title_en": "Light tote bag",
        "description_pt": "Modelo light. Disponível em branco, preto, cru e vermelho.",
        "description_en": "Light model. Available in white, black, beige and red.",
        "category": "totebags",
        "price": 15.00,
        "variants": {
            "colors": ["white", "black", "beige", "red"]
        },
        "images": ["https://images.pexels.com/photos/9869067/pexels-photo-9869067.jpeg"],
        "is_bundle": False
    },
    {
        "id": "poster-a4",
        "title_pt": "Poster A4",
        "title_en": "A4 Poster",
        "description_pt": "Todos os textos e fotografias assinados pela autora. 21 por 29,7 cm (moldura não incluída).",
        "description_en": "All texts and photographs signed by the author. 21 by 29.7 cm (frame not included).",
        "category": "posters",
        "price": 20.00,
        "images": ["https://images.unsplash.com/photo-1600027492046-b8d97b93fa90?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "is_bundle": False
    },
    {
        "id": "poster-a3",
        "title_pt": "Poster A3",
        "title_en": "A3 Poster",
        "description_pt": "Todos os textos e fotografias assinados pela autora. 297 por 420 cm (moldura não incluída).",
        "description_en": "All texts and photographs signed by the author. 297 by 420 cm (frame not included).",
        "category": "posters",
        "price": 45.00,
        "images": ["https://images.unsplash.com/photo-1600027492046-b8d97b93fa90?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "is_bundle": False
    },
    {
        "id": "postcard-a6",
        "title_pt": "Postal A6",
        "title_en": "A6 Postcard",
        "description_pt": "Postal assinado pela autora. 10 por 15cm.",
        "description_en": "Postcard signed by the author. 10 by 15cm.",
        "category": "posters",
        "price": 10.00,
        "images": ["https://images.unsplash.com/photo-1600027492046-b8d97b93fa90?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "is_bundle": False
    },
    {
        "id": "notebook",
        "title_pt": "Caderno",
        "title_en": "Notebook",
        "description_pt": "Caderno. Disponível em branco e preto.",
        "description_en": "Notebook. Available in white and black.",
        "category": "complementos",
        "price": 10.00,
        "variants": {
            "colors": ["white", "black"]
        },
        "images": ["https://images.unsplash.com/photo-1517842536343-262d0c8a7c0c?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "is_bundle": False
    },
    {
        "id": "notebook-love",
        "title_pt": "Caderno A6 Love (azul)",
        "title_en": "A6 Love Notebook (blue)",
        "description_pt": "Caderno A6 azul com design Love.",
        "description_en": "Blue A6 notebook with Love design.",
        "category": "complementos",
        "price": 8.50,
        "images": ["https://images.unsplash.com/photo-1517842536343-262d0c8a7c0c?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "is_bundle": False
    },
    {
        "id": "pins-single",
        "title_pt": "Pin",
        "title_en": "Pin",
        "description_pt": "Pin individual. Personalização tem um extra de 0,50€.",
        "description_en": "Single pin. Customization has an extra 0,50€.",
        "category": "complementos",
        "price": 1.00,
        "images": ["https://images.unsplash.com/photo-1611923109763-e1f0e7c43a09?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "is_bundle": False
    },
    {
        "id": "pins-set",
        "title_pt": "Conjunto de 6 Pins",
        "title_en": "Set of 6 Pins",
        "description_pt": "Conjunto de 6 pins. Personalização tem um extra de 0,50€ por pin.",
        "description_en": "Set of 6 pins. Customization has an extra 0,50€ per pin.",
        "category": "complementos",
        "price": 4.50,
        "images": ["https://images.unsplash.com/photo-1611923109763-e1f0e7c43a09?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "is_bundle": False
    },
    {
        "id": "bundle-write",
        "title_pt": "Write that love letter",
        "title_en": "Write that love letter",
        "description_pt": "Conjunto completo com T-shirt (28€), Saco (19€) e Caderno (10€). Preço especial 52€ (habitualmente 57€).",
        "description_en": "Complete set with T-shirt (28€), Bag (19€) and Notebook (10€). Special price 52€ (usually 57€).",
        "category": "bundles",
        "price": 52.00,
        "original_price": 57.00,
        "is_bundle": True,
        "bundle_items": [
            {"product_id": "tshirt-poem-ss", "title_pt": "T-shirt", "title_en": "T-shirt"},
            {"product_id": "tote-structured", "title_pt": "Saco", "title_en": "Bag"},
            {"product_id": "notebook", "title_pt": "Caderno", "title_en": "Notebook"}
        ],
        "images": ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?crop=entropy&cs=srgb&fm=jpg&q=85"]
    },
    {
        "id": "bundle-love",
        "title_pt": "In love with myself",
        "title_en": "In love with myself",
        "description_pt": "Conjunto com Saco (19€) e Caderno (10€). Preço especial 24€ (habitualmente 29€).",
        "description_en": "Set with Bag (19€) and Notebook (10€). Special price 24€ (usually 29€).",
        "category": "bundles",
        "price": 24.00,
        "original_price": 29.00,
        "is_bundle": True,
        "bundle_items": [
            {"product_id": "tote-structured", "title_pt": "Saco", "title_en": "Bag"},
            {"product_id": "notebook", "title_pt": "Caderno", "title_en": "Notebook"}
        ],
        "images": ["https://images.pexels.com/photos/9869067/pexels-photo-9869067.jpeg"]
    },
    {
        "id": "bundle-once",
        "title_pt": "Era uma vez",
        "title_en": "Once upon a time",
        "description_pt": "Conjunto com dois posters. Preço especial 45€ (habitualmente 50€).",
        "description_en": "Set with two posters. Special price 45€ (usually 50€).",
        "category": "bundles",
        "price": 45.00,
        "original_price": 50.00,
        "is_bundle": True,
        "bundle_items": [
            {"product_id": "poster-a4", "title_pt": "Era uma vez", "title_en": "Once upon a time"},
            {"product_id": "poster-a4", "title_pt": "Um poema de amor", "title_en": "A love poem"}
        ],
        "images": ["https://images.unsplash.com/photo-1600027492046-b8d97b93fa90?crop=entropy&cs=srgb&fm=jpg&q=85"]
    }
]

async def seed_products():
    print("Seeding products...")
    
    await db.products.delete_many({})
    
    for product in products:
        from datetime import datetime, timezone
        product['created_at'] = datetime.now(timezone.utc).isoformat()
        await db.products.insert_one(product)
    
    print(f"Seeded {len(products)} products successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_products())
