from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from datetime import datetime

from database import Base


class City(Base):

    __tablename__ = "cities"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        unique=True,
        nullable=False
    )

    state = Column(
        String,
        nullable=False
    )

    is_active = Column(
        String,
        default="true",
        nullable=False
    )

    complaints = relationship(
        "Complaint",
        back_populates="city"
    )


class Department(Base):

    __tablename__ = "departments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        unique=True,
        nullable=False
    )

    description = Column(
        Text
    )

    is_active = Column(
        String,
        default="true",
        nullable=False
    )

    complaints = relationship(
        "Complaint",
        back_populates="department"
    )


class IssueCategory(Base):

    __tablename__ = "issue_categories"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        unique=True,
        nullable=False
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=False
    )

    is_active = Column(
        String,
        default="true",
        nullable=False
    )

    department = relationship(
        "Department"
    )
    

class Officer(Base):

    __tablename__ = "officers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    officer_id = Column(
        String,
        unique=True,
        nullable=False
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=False
    )

    city_id = Column(
        Integer,
        ForeignKey("cities.id"),
        nullable=False
    )

    is_active = Column(
        String,
        default="true",
        nullable=False
    )

    department = relationship(
        "Department"
    )

    city = relationship(
        "City"
    )


class Complaint(Base):

    __tablename__ = "complaints"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    city_id = Column(
        Integer,
        ForeignKey("cities.id"),
        nullable=False
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=False
    )

    officer_id = Column(
        Integer,
        ForeignKey("officers.id"),
        nullable=True
    )

    category_id = Column(
        Integer,
        ForeignKey("issue_categories.id"),
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    status = Column(
        String,
        default="Submitted",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    city = relationship(
        "City",
        back_populates="complaints"
    )

    department = relationship(
        "Department",
        back_populates="complaints"
    )

    category = relationship(
        "IssueCategory"
    )

    officer = relationship(
        "Officer"
    )


class ComplaintHistory(Base):

    __tablename__ = "complaint_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.id"),
        nullable=False
    )

    old_status = Column(
        String,
        nullable=True
    )

    new_status = Column(
        String,
        nullable=False
    )

    remarks = Column(
        Text,
        nullable=True
    )

    changed_by = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    complaint = relationship(
        "Complaint"
    )


