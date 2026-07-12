from sqlalchemy.orm import Session
from .. import models


def get_config(db: Session) -> models.ESGConfig:
    """Return the singleton config row, creating it with defaults if missing."""
    config = db.query(models.ESGConfig).filter(models.ESGConfig.id == 1).first()
    if not config:
        config = models.ESGConfig(id=1)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config
