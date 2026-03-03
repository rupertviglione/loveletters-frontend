"""
Script para popular MongoDB Atlas com produtos
Executar DEPOIS de configurar MongoDB Atlas e Railway

Uso:
1. Instala dependências: pip install pymongo python-dotenv
2. Cria .env com MONGO_URL e DB_NAME
3. Executa: python seed_remote.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone

# CONFIGURA AQUI a tua connection string do MongoDB Atlas
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb+srv://loveletters:3BlZeRabV3E9XSGp@loveletters.pcoahxd.mongodb.net/?appName=loveletters')
DB_NAME = os.environ.get('DB_NAME', 'loveletters_prod')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

products = [
    {
        "id": "tshirt-write-that",
        "title_pt": "T-shirt Write that love letter",
        "title_en": "T-shirt Write that love letter",
        "description_pt": "T-shirt com frase bordada. Manga comprida. Disponível em branco, preto e vermelho.",
        "description_en": "T-shirt with embroidered phrase. Long sleeve. Available in white, black and red.",
        "category": "tshirts",
        "price": 30.00,
        "variants": {
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "colors": ["white", "black", "red"]
        },
        "images": ["/img/t-shirt-write-that.png", "/img/t-shirt-write-that-2.jpg"],
        "is_bundle": False
    },
    {
        "id": "tshirt-o-poema-e-tu",
        "title_pt": "T-shirt O poema és tu",
        "title_en": "T-shirt The poem is you",
        "description_pt": "T-shirt com poema \"O poema és tu\". Manga curta.",
        "description_en": "T-shirt with poem \"The poem is you\". Short sleeve.",
        "category": "tshirts",
        "price": 28.00,
        "variants": {
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "colors": ["white", "black", "red"]
        },
        "images": ["/img/t-shirt-o-poema-e-tu-1.png"],
        "is_bundle": False
    },
    {
        "id": "tshirt-hope",
        "title_pt": "T-shirt Hope",
        "title_en": "T-shirt Hope",
        "description_pt": "T-shirt com frase Hope no bolso.",
        "description_en": "T-shirt with Hope phrase on pocket.",
        "category": "tshirts",
        "price": 25.00,
        "variants": {
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "colors": ["white", "black", "red"]
        },
        "images": ["/img/t-shirt-hope.jpg"],
        "is_bundle": False
    },
    {
        "id": "tote-o-poema",
        "title_pt": "Tote bag O poema",
        "title_en": "Tote bag The poem",
        "description_pt": "Modelo estruturado com frase.",
        "description_en": "Structured model with phrase.",
        "category": "totebags",
        "price": 19.00,
        "variants": {
            "colors": ["white", "black", "beige", "red"]
        },
        "images": ["/img/tote-preto-o-poema.webp", "/img/tote-o-poema-3.webp"],
        "is_bundle": False
    },
    {
        "id": "tote-love",
        "title_pt": "Tote bag Love",
        "title_en": "Tote bag Love",
        "description_pt": "Modelo light com palavra Love.",
        "description_en": "Light model with word Love.",
        "category": "totebags",
        "price": 15.00,
        "variants": {
            "colors": ["white", "black", "beige", "red"]
        },
        "images": ["/img/tote-love.webp"],
        "is_bundle": False
    },
    {
        "id": "poster-intimo",
        "title_pt": "Poster Íntimo",
        "title_en": "Poster Intimate",
        "description_pt": "Poema \"Íntimo. Livre. Doce.\" A4 (21 x 29,7 cm)",
        "description_en": "Poem \"Intimate. Free. Sweet.\" A4 (21 x 29.7 cm)",
        "category": "posters",
        "price": 20.00,
        "images": ["/img/poster-intimo.jpg"],
        "is_bundle": False
    },
    {
        "id": "poster-antidoto",
        "title_pt": "Poster Antídoto",
        "title_en": "Poster Antidote",
        "description_pt": "Poema \"Desço as tuas escadas de fogo\" A4",
        "description_en": "Poem \"I descend your stairs of fire\" A4",
        "category": "posters",
        "price": 20.00,
        "images": ["/img/poster-antidoto-black.png"],
        "is_bundle": False
    },
    {
        "id": "caderno",
        "title_pt": "Caderno",
        "title_en": "Notebook",
        "description_pt": "Caderno. Disponível em branco e preto.",
        "description_en": "Notebook. Available in white and black.",
        "category": "complementos",
        "price": 10.00,
        "variants": {
            "colors": ["white", "black"]
        },
        "images": ["/img/escadote-cadernos.webp"],
        "is_bundle": False
    },
    {
        "id": "pins-set",
        "title_pt": "Conjunto de Pins",
        "title_en": "Pin Set",
        "description_pt": "Conjunto de pins.",
        "description_en": "Pin set.",
        "category": "complementos",
        "price": 4.50,
        "images": ["/img/pins.png"],
        "is_bundle": False
    },
    {
        "id": "bundle-write",
        "title_pt": "Write that love letter",
        "title_en": "Write that love letter",
        "description_pt": "Conjunto: T-shirt + Tote bag + Caderno. Poupa 5€.",
        "description_en": "Set: T-shirt + Tote bag + Notebook. Save 5€.",
        "category": "bundles",
        "price": 52.00,
        "original_price": 57.00,
        "is_bundle": True,
        "bundle_items": [
            {"product_id": "tshirt-write-that", "title_pt": "T-shirt", "title_en": "T-shirt"},
            {"product_id": "tote-o-poema", "title_pt": "Tote bag", "title_en": "Tote bag"},
            {"product_id": "caderno", "title_pt": "Caderno", "title_en": "Notebook"}
        ],
        "images": ["/img/t-shirt-write-that.png"]
    }
]

async def seed_products():
    print(f"Conectando a MongoDB Atlas...")
    print(f"Database: {DB_NAME}")
    
    try:
        # Test connection
        await db.command('ping')
        print("✓ Conexão bem-sucedida!")
        
        # Delete existing
        result = await db.products.delete_many({})
        print(f"✓ Removidos {result.deleted_count} produtos antigos")
        
        # Insert new
        for product in products:
            product['created_at'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.products.insert_many(products)
        print(f"✓ Inseridos {len(result.inserted_ids)} produtos!")
        
        # Verify
        count = await db.products.count_documents({})
        print(f"✓ Total de produtos na database: {count}")
        
        print("\n✅ Seed completo com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Love Letters - MongoDB Seed Script")
    print("=" * 50)
    asyncio.run(seed_products())
