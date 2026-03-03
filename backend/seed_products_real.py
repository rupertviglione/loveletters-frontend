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
        "description_pt": "T-shirt com poema \"O poema és tu\". Manga curta. Disponível em branco, preto e vermelho.",
        "description_en": "T-shirt with poem \"The poem is you\". Short sleeve. Available in white, black and red.",
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
        "description_pt": "T-shirt com frase Hope no bolso. Manga curta.",
        "description_en": "T-shirt with Hope phrase on pocket. Short sleeve.",
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
        "id": "tshirt-flores",
        "title_pt": "T-shirt Flores",
        "title_en": "T-shirt Flowers",
        "description_pt": "T-shirt com design floral. Manga curta.",
        "description_en": "T-shirt with floral design. Short sleeve.",
        "category": "tshirts",
        "price": 28.00,
        "variants": {
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "colors": ["white", "black"]
        },
        "images": ["/img/t-shirt-flores.jpg"],
        "is_bundle": False
    },
    {
        "id": "tshirt-crianca",
        "title_pt": "T-shirt de Criança com pin personalizado",
        "title_en": "Kids t-shirt with custom pin",
        "description_pt": "T-shirt infantil com frase no bolso e pin personalizado incluído.",
        "description_en": "Kids t-shirt with pocket phrase and custom pin included.",
        "category": "tshirts",
        "price": 24.00,
        "variants": {
            "sizes": ["4-6", "6-8", "8-10", "10-12"],
            "colors": ["white", "black", "red"]
        },
        "images": ["/img/t-shirt-tu-és-o-meu-poema-pin.jpg"],
        "is_bundle": False
    },
    {
        "id": "tote-o-poema",
        "title_pt": "Tote bag O poema",
        "title_en": "Tote bag The poem",
        "description_pt": "Modelo estruturado com frase. Disponível em branco, preto, cru e vermelho.",
        "description_en": "Structured model with phrase. Available in white, black, beige and red.",
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
        "id": "tote-dream",
        "title_pt": "Tote bag Dream",
        "title_en": "Tote bag Dream",
        "description_pt": "Modelo estruturado.",
        "description_en": "Structured model.",
        "category": "totebags",
        "price": 19.00,
        "variants": {
            "colors": ["white", "black", "beige"]
        },
        "images": ["/img/tote-dream.jpg"],
        "is_bundle": False
    },
    {
        "id": "tote-hope",
        "title_pt": "Tote bag Hope",
        "title_en": "Tote bag Hope",
        "description_pt": "Modelo light.",
        "description_en": "Light model.",
        "category": "totebags",
        "price": 15.00,
        "variants": {
            "colors": ["beige", "black"]
        },
        "images": ["/img/tote-hope.webp"],
        "is_bundle": False
    },
    {
        "id": "poster-intimo",
        "title_pt": "Poster Íntimo",
        "title_en": "Poster Intimate",
        "description_pt": "Poema \"Íntimo. Livre. Doce.\" com fotografia assinada pela autora. A4 (21 x 29,7 cm) - moldura não incluída.",
        "description_en": "Poem \"Intimate. Free. Sweet.\" with photograph signed by the author. A4 (21 x 29.7 cm) - frame not included.",
        "category": "posters",
        "price": 20.00,
        "images": ["/img/poster-intimo.jpg", "/img/poster-intimo-fotografia.jpg"],
        "is_bundle": False
    },
    {
        "id": "poster-antidoto",
        "title_pt": "Poster Antídoto",
        "title_en": "Poster Antidote",
        "description_pt": "Poema \"Desço as tuas escadas de fogo\" com fotografia. A4 (21 x 29,7 cm) - moldura não incluída.",
        "description_en": "Poem \"I descend your stairs of fire\" with photograph. A4 (21 x 29.7 cm) - frame not included.",
        "category": "posters",
        "price": 20.00,
        "images": ["/img/poster-antidoto-black.png", "/img/poster-antidoto-fotografia.webp"],
        "is_bundle": False
    },
    {
        "id": "poster-se-as-arvores",
        "title_pt": "Poster Se as árvores e os rios te esquecem",
        "title_en": "Poster If trees and rivers forget you",
        "description_pt": "Poema com fotografia assinada. A3 (29,7 x 42 cm) - moldura não incluída.",
        "description_en": "Poem with signed photograph. A3 (29.7 x 42 cm) - frame not included.",
        "category": "posters",
        "price": 45.00,
        "images": ["/img/poster-se-as-arvores-e-os-rios-te-esquecem-fotografia.webp"],
        "is_bundle": False
    },
    {
        "id": "poster-margem",
        "title_pt": "Poster Margem",
        "title_en": "Poster Margin",
        "description_pt": "Poema com fotografia. A4 (21 x 29,7 cm) - moldura não incluída.",
        "description_en": "Poem with photograph. A4 (21 x 29.7 cm) - frame not included.",
        "category": "posters",
        "price": 20.00,
        "images": ["/img/poster-margem-fotografia.webp"],
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
        "description_pt": "Conjunto de pins. Personalização tem um extra de 0,50€ por pin.",
        "description_en": "Pin set. Customization has an extra 0.50€ per pin.",
        "category": "complementos",
        "price": 4.50,
        "images": ["/img/pins.png"],
        "is_bundle": False
    },
    {
        "id": "bundle-write",
        "title_pt": "Write that love letter",
        "title_en": "Write that love letter",
        "description_pt": "Conjunto completo: T-shirt Write that love letter + Tote bag + Caderno. Poupa 5€.",
        "description_en": "Complete set: Write that love letter T-shirt + Tote bag + Notebook. Save 5€.",
        "category": "bundles",
        "price": 52.00,
        "original_price": 57.00,
        "is_bundle": True,
        "bundle_items": [
            {"product_id": "tshirt-write-that", "title_pt": "T-shirt Write that love letter", "title_en": "T-shirt Write that love letter"},
            {"product_id": "tote-o-poema", "title_pt": "Tote bag", "title_en": "Tote bag"},
            {"product_id": "caderno", "title_pt": "Caderno", "title_en": "Notebook"}
        ],
        "images": ["/img/t-shirt-write-that.png", "/img/tote-o-poema-3.webp"]
    },
    {
        "id": "bundle-era-uma-vez",
        "title_pt": "Era uma vez",
        "title_en": "Once upon a time",
        "description_pt": "Conjunto com dois posters. Poupa 5€.",
        "description_en": "Set with two posters. Save 5€.",
        "category": "bundles",
        "price": 45.00,
        "original_price": 50.00,
        "is_bundle": True,
        "bundle_items": [
            {"product_id": "poster-intimo", "title_pt": "Poster Íntimo", "title_en": "Poster Intimate"},
            {"product_id": "poster-se-as-arvores", "title_pt": "Poster Se as árvores", "title_en": "Poster If trees"}
        ],
        "images": ["/img/era-uma-vez.png", "/img/era-uma-vez-1.png"]
    }
]

async def seed_products():
    print("Seeding products with real images...")
    
    await db.products.delete_many({})
    
    for product in products:
        from datetime import datetime, timezone
        product['created_at'] = datetime.now(timezone.utc).isoformat()
        await db.products.insert_one(product)
    
    print(f"Seeded {len(products)} products successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_products())