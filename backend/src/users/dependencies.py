

# 2. Implementasi di Route (routes.py)

# Sekarang, kamu cukup memanggil dependency tersebut di endpoint yang kamu inginkan.
# Python

# @users_router.get("/me", response_model=User)
# async def read_user_me(
#     # Cukup gunakan ini, pengecekan is_active sudah terjadi otomatis
#     current_user = Depends(get_current_active_user) 
# ):
#     return current_user

# @users_router.get("/admin-only-stats")
# async def get_system_stats(
#     # Hanya user aktif YANG JUGA superuser yang bisa masuk
#     admin_user = Depends(get_current_superuser)
# ):
#     return {"stats": "Data rahasia sistem"}


from fastapi import Depends
from .repository import UserRepository
from .service import UserService

async def get_user_repository():
    return UserRepository()

async def get_user_service(repo: UserRepository = Depends(get_user_repository)):
    return UserService(repo)