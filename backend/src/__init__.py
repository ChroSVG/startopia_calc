from fastapi import FastAPI
from src.auth.routes import auth_router, login_router
from src.users.routes import users_router
from src.books.routes import book_router
from src.items.routes import item_router
from src.reviews.routes import review_router
from src.tags.routes import tags_router
from src.categories.routes import category_router
from src.inventory.routes import inventory_router
from src.activity_log.routes import activity_log_router
from .errors import register_all_errors
from .middleware import register_middleware


version = "v1"

description = """
A REST API for a book review web service.

This REST API is able to;
- Create Read Update And delete books
- Add reviews to books
- Add tags to Books e.t.c.
    """

version_prefix =f"/api/{version}"

app = FastAPI(
    title="Bookly",
    description=description,
    version=version,
    license_info={"name": "MIT License", "url": "https://opensource.org/license/mit"},
    contact={
        "name": "Ssali Jonathan",
        "url": "https://github.com/jod35",
        "email": "ssalijonathank@gmail.com",
    },
    terms_of_service="httpS://example.com/tos",
    openapi_url=f"{version_prefix}/openapi.json",
    docs_url=f"{version_prefix}/docs",
    redoc_url=f"{version_prefix}/redoc"
)

register_all_errors(app)

register_middleware(app)


app.include_router(book_router, prefix=f"{version_prefix}/books", tags=["books"])
app.include_router(item_router, prefix=f"{version_prefix}/items", tags=["items"])
app.include_router(auth_router, prefix=f"{version_prefix}/auth", tags=["auth"])
app.include_router(login_router, prefix=f"{version_prefix}/login", tags=["login"])
app.include_router(users_router, prefix=f"{version_prefix}/users", tags=["users"])
app.include_router(review_router, prefix=f"{version_prefix}/reviews", tags=["reviews"])
app.include_router(tags_router, prefix=f"{version_prefix}/tags", tags=["tags"])
app.include_router(category_router, prefix=f"{version_prefix}/categories", tags=["categories"])
app.include_router(inventory_router, prefix=f"{version_prefix}/inventory", tags=["inventory"])
app.include_router(activity_log_router, prefix=f"{version_prefix}/activity-logs", tags=["activity-logs"])
