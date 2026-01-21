"""Database connection and session management for the PSP service."""

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from src.payment.config import get_payment_settings

# Create engine lazily to allow settings to be loaded
_engine = None


def get_engine():
    """Get or create the database engine.

    Returns:
        Engine: SQLAlchemy engine instance.
    """
    global _engine
    if _engine is None:
        settings = get_payment_settings()
        _engine = create_engine(
            settings.database_url,
            echo=settings.debug,
            connect_args={"check_same_thread": False},
        )
    return _engine


def get_session() -> Generator[Session, None, None]:
    """Get a database session.

    Yields:
        Session: A SQLModel session for database operations.
    """
    with Session(get_engine()) as session:
        yield session


def init_payment_tables() -> None:
    """Initialize the PSP database tables.

    Creates the vault_token, payment_intent, and idempotency_store tables.
    Also creates the merchant tables if they don't exist (for testing).
    """
    # Import models to register them with SQLModel metadata
    # These imports are necessary for table creation even if not directly used
    from src.payment.db import (
        models as _models,  # noqa: F401  # pyright: ignore[reportUnusedImport]
    )

    SQLModel.metadata.create_all(get_engine())


def reset_engine() -> None:
    """Reset the database engine. Useful for testing."""
    global _engine
    if _engine is not None:
        _engine.dispose()
        _engine = None
