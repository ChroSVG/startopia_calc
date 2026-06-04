from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from src.auth.dependencies import get_current_active_user
from src.db.main import get_session
from src.db.models import User
from .dependencies import get_mass_service
from .schemas import MassCreate, MassModel, MassUpdate, MassesPublic
from .service import MassService

mass_router = APIRouter()


@mass_router.get("/", response_model=MassesPublic, operation_id="readMasses")
async def get_masses(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_session),
    mass_service: MassService = Depends(get_mass_service),
    current_user: User = Depends(get_current_active_user),
):
    masses, count = await mass_service.get_user_masses(
        str(current_user.uid), session, skip, limit
    )
    return {"data": masses, "count": count}


@mass_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=MassModel,
    operation_id="createMass",
)
async def create_mass(
    mass_data: MassCreate,
    session: AsyncSession = Depends(get_session),
    mass_service: MassService = Depends(get_mass_service),
    current_user: User = Depends(get_current_active_user),
):
    return await mass_service.create_mass(mass_data, str(current_user.uid), session)


@mass_router.get("/{mass_uid}", response_model=MassModel, operation_id="readMass")
async def get_mass(
    mass_uid: str,
    session: AsyncSession = Depends(get_session),
    mass_service: MassService = Depends(get_mass_service),
    current_user: User = Depends(get_current_active_user),
):
    mass = await mass_service.get_mass(mass_uid, session)
    if not mass:
        raise HTTPException(status_code=404, detail="Mass not found")
    if str(mass.user_uid) != str(current_user.uid):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return mass


@mass_router.patch("/{mass_uid}", response_model=MassModel, operation_id="updateMass")
async def update_mass(
    mass_uid: str,
    update_data: MassUpdate,
    session: AsyncSession = Depends(get_session),
    mass_service: MassService = Depends(get_mass_service),
    current_user: User = Depends(get_current_active_user),
):
    mass = await mass_service.update_mass(mass_uid, update_data, str(current_user.uid), session)
    if not mass:
        raise HTTPException(status_code=404, detail="Mass not found")
    return mass


@mass_router.delete("/{mass_uid}", status_code=status.HTTP_204_NO_CONTENT, operation_id="deleteMass")
async def delete_mass(
    mass_uid: str,
    session: AsyncSession = Depends(get_session),
    mass_service: MassService = Depends(get_mass_service),
    current_user: User = Depends(get_current_active_user),
):
    deleted = await mass_service.delete_mass(mass_uid, str(current_user.uid), session)
    if not deleted:
        raise HTTPException(status_code=404, detail="Mass not found")
    return None


@mass_router.post("/{mass_uid}/calculate", response_model=MassModel, operation_id="calculateMass")
async def calculate_mass(
    mass_uid: str,
    session: AsyncSession = Depends(get_session),
    mass_service: MassService = Depends(get_mass_service),
    current_user: User = Depends(get_current_active_user),
):
    mass = await mass_service.calculate_mass(mass_uid, str(current_user.uid), session)
    if not mass:
        raise HTTPException(status_code=404, detail="Mass not found")
    return mass
