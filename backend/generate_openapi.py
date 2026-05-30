import json
from src import app

def generate_openapi():
    openapi_data = app.openapi()
    with open("openapi.json", "w") as f:
        json.dump(openapi_data, f, indent=4)
    print("Successfully generated openapi.json")

if __name__ == "__main__":
    generate_openapi()
