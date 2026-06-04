from typing import Generic, List, Optional, Type, TypeVar, Any
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

ModelType = TypeVar("ModelType")

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get_by_uid(self, session: AsyncSession, uid: Any) -> Optional[ModelType]:
        statement = select(self.model).where(self.model.uid == uid)  # type: ignore[attr-defined]
        result = await session.exec(statement)
        return result.first()

    async def get_all(self, session: AsyncSession, skip: int = 0, limit: int = 100) -> List[ModelType]:
        statement = select(self.model).offset(skip).limit(limit)
        result = await session.exec(statement)
        return list(result.all())

    async def get_count(self, session: AsyncSession) -> int:
        statement = select(func.count()).select_from(self.model)
        result = await session.exec(statement)
        return result.one() or 0

    async def create(self, session: AsyncSession, obj_in: dict) -> ModelType:
        db_obj = self.model(**obj_in)
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return db_obj

    async def update(self, session: AsyncSession, db_obj: ModelType, obj_in: dict) -> ModelType:
        for field in obj_in:
            if hasattr(db_obj, field):
                setattr(db_obj, field, obj_in[field])

        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return db_obj

    async def delete(self, session: AsyncSession, db_obj: ModelType) -> None:
        await session.delete(db_obj)
        await session.commit()
