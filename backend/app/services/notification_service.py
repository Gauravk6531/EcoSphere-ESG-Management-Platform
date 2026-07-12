from sqlalchemy.orm import Session
from .. import models
from .config_service import get_config


def notify(db: Session, employee_id, type_: str, message: str, gate_field: str = None):
    """
    Create a notification record. `gate_field` is the ESGConfig boolean field name
    that must be True for this notification type to be sent (e.g. notify_badge_unlock).
    If gate_field is None, the notification is always sent.
    """
    if gate_field:
        config = get_config(db)
        if not getattr(config, gate_field, True):
            return None
    note = models.Notification(employee_id=employee_id, type=type_, message=message)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
