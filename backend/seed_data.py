"""
Optional helper to populate the database with demo data so the dashboard
isn't empty on first run.

Usage:
    cd backend
    python seed_data.py
"""
import datetime
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, Base, engine
from app import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()


def get_or_create(model, defaults=None, **kwargs):
    instance = db.query(model).filter_by(**kwargs).first()
    if instance:
        return instance
    params = {**kwargs, **(defaults or {})}
    instance = model(**params)
    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance


def run():
    print("Seeding EcoSphere demo data...")

    config = db.query(models.ESGConfig).filter(models.ESGConfig.id == 1).first()
    if not config:
        config = models.ESGConfig(id=1)
        db.add(config)
        db.commit()

    eng = get_or_create(models.Department, name="Engineering", code="ENG")
    sales = get_or_create(models.Department, name="Sales", code="SAL")
    ops = get_or_create(models.Department, name="Operations", code="OPS")

    alice = get_or_create(models.Employee, email="alice@ecosphere.io",
                           defaults={"name": "Alice Chen", "department_id": eng.id, "is_department_head": True})
    bob = get_or_create(models.Employee, email="bob@ecosphere.io",
                         defaults={"name": "Bob Martins", "department_id": sales.id})
    carol = get_or_create(models.Employee, email="carol@ecosphere.io",
                           defaults={"name": "Carol Singh", "department_id": ops.id, "is_department_head": True})

    eng.head_id = alice.id
    ops.head_id = carol.id
    db.commit()

    csr_cat = get_or_create(models.Category, name="Community Volunteering", type=models.CategoryType.csr_activity)
    challenge_cat = get_or_create(models.Category, name="Energy Reduction", type=models.CategoryType.challenge)

    diesel_factor = get_or_create(models.EmissionFactor, name="Diesel Fuel",
                                   defaults={"category": "fleet", "co2e_value": 2.68, "unit": "litre",
                                             "source": "DEFRA 2024"})
    electricity_factor = get_or_create(models.EmissionFactor, name="Grid Electricity",
                                       defaults={"category": "utility", "co2e_value": 0.45, "unit": "kWh",
                                                 "source": "DEFRA 2024"})

    tx1 = models.CarbonTransaction(
        source_document_type="fleet", source_document_ref="FLEET-001",
        emission_factor_id=diesel_factor.id, quantity=120,
        co2e_calculated=round(120 * diesel_factor.co2e_value, 2),
        department_id=ops.id, date=datetime.date.today() - datetime.timedelta(days=10),
    )
    db.add(tx1)

    goal = models.EnvironmentalGoal(
        target_metric="Reduce fleet emissions (kg CO2e)", target_value=1000, current_value=400,
        deadline=datetime.date.today() + datetime.timedelta(days=90), department_id=ops.id,
    )
    db.add(goal)

    activity = models.CSRActivity(
        title="Beach Cleanup Drive", category_id=csr_cat.id, department_id=sales.id,
        date=datetime.date.today() - datetime.timedelta(days=5),
        description="Community coastal cleanup event", evidence_required=True,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    participation = models.EmployeeParticipation(
        employee_id=bob.id, activity_id=activity.id, proof_url="https://example.com/proof.jpg",
        approval_status=models.ApprovalStatus.approved, points_earned=50,
        completion_date=datetime.date.today() - datetime.timedelta(days=4),
    )
    db.add(participation)
    bob.points_balance += 50

    db.add(models.TrainingCompletion(
        employee_id=alice.id,
        training_name="Inclusive Workplace Basics",
        provider="EcoSphere Academy",
        due_date=datetime.date.today() + datetime.timedelta(days=21),
        completion_date=datetime.date.today() - datetime.timedelta(days=2),
        status="completed",
        score=92,
        certificate_url="https://example.com/certificates/inclusive-workplace",
    ))
    db.add(models.TrainingCompletion(
        employee_id=carol.id,
        training_name="CSR Reporting Standards",
        provider="EcoSphere Academy",
        due_date=datetime.date.today() + datetime.timedelta(days=14),
        status="assigned",
    ))

    policy = models.ESGPolicy(name="Code of Conduct", document_url="https://example.com/policy.pdf", version="2.1")
    policy.departments = [eng, sales, ops]
    db.add(policy)
    db.commit()
    db.refresh(policy)

    ack = models.PolicyAcknowledgement(policy_id=policy.id, employee_id=alice.id,
                                        acknowledged_date=datetime.datetime.utcnow())
    db.add(ack)

    audit = models.Audit(title="Q2 Governance Audit", auditor="External Auditor Co.",
                          department_id=ops.id, date=datetime.date.today() - datetime.timedelta(days=20),
                          findings_summary="Minor documentation gaps identified.")
    db.add(audit)
    db.commit()
    db.refresh(audit)

    issue = models.ComplianceIssue(
        audit_id=audit.id, severity=models.Severity.medium,
        description="Missing signed acknowledgement records for 2 employees",
        owner_id=carol.id, due_date=datetime.date.today() + datetime.timedelta(days=14),
    )
    db.add(issue)

    badge = models.Badge(name="Green Champion", description="Awarded for reaching 100 XP",
                          unlock_metric="xp_total", unlock_comparator=">=", unlock_threshold=100)
    db.add(badge)

    reward = models.Reward(name="Eco Water Bottle", description="Reusable insulated bottle",
                            points_required=50, stock=25)
    db.add(reward)

    challenge = models.Challenge(
        title="No-Print Week", category_id=challenge_cat.id,
        description="Avoid printing documents for one full week", xp=100, difficulty="easy",
        evidence_required=False, deadline=datetime.date.today() + datetime.timedelta(days=7),
        status=models.ChallengeStatus.active,
    )
    db.add(challenge)

    db.commit()
    print("Seed complete.")


if __name__ == "__main__":
    run()
    db.close()
