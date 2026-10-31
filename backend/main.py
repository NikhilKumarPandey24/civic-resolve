from __future__ import annotations

import json
import os
import secrets
import warnings
from email.parser import BytesParser
from email.policy import default as email_policy
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Security
from fastapi import Request
from fastapi.responses import FileResponse

from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials

from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator

from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import jwt

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import engine
from database import SessionLocal
from database import Base

from models import Complaint
from models import ComplaintImage
from models import City
from models import Department
from models import IssueCategory
from models import ComplaintHistory
from models import Officer
from models import User

from datetime import datetime
from datetime import timedelta
from datetime import timezone

from PIL import Image
from PIL import ImageOps
from PIL import UnidentifiedImageError


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not configured.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
MAX_COMPLAINT_IMAGES = 5
MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_TOTAL_IMAGE_BYTES = MAX_COMPLAINT_IMAGES * MAX_IMAGE_BYTES
MAX_MULTIPART_REQUEST_BYTES = MAX_TOTAL_IMAGE_BYTES + 64 * 1024
MAX_JSON_REQUEST_BYTES = 64 * 1024
MAX_IMAGE_PIXELS = 25_000_000
UPLOAD_DIR = Path(os.getenv(
    "COMPLAINT_IMAGE_DIR",
    str(Path(__file__).resolve().parent / "uploads" / "complaints")
)).resolve()

IMAGE_FORMATS = {
    "JPEG": ("image/jpeg", ".jpg"),
    "PNG": ("image/png", ".png"),
    "WEBP": ("image/webp", ".webp"),
}


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


security = HTTPBearer(auto_error=False)


def get_current_user(

    credentials: HTTPAuthorizationCredentials | None = Security(security),
    db: Session = Depends(get_db)

):

    if credentials is None:
        return None

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")
        role = payload.get("role")

        if user_id is None or role is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

        # Check the user's current status in the database
        user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User account not found."
            )

        if user.is_active != "true":
            raise HTTPException(
                status_code=401,
                detail="Your account is inactive."
            )

        # Also make sure the token role matches the current database role
        if user.role != role:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

        return {
            "user_id": user.id,
            "role": user.role
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )


def require_admin(

    current_user: dict | None = Depends(get_current_user)

):

    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated."
        )

    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )

    return current_user


def require_officer(

    current_user: dict | None = Depends(get_current_user)

):

    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated."
        )

    if current_user["role"] != "officer":
        raise HTTPException(
            status_code=403,
            detail="Officer access required."
        )

    return current_user


async def read_limited_body(request: Request, limit: int) -> bytes:
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > limit:
                raise HTTPException(status_code=413, detail="The upload is too large.")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid content length.")

    chunks = []
    size = 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > limit:
            raise HTTPException(status_code=413, detail="The upload is too large.")
        chunks.append(chunk)
    return b"".join(chunks)


def normalize_uploaded_image(image_bytes: bytes) -> tuple[bytes, str, str]:
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(image_bytes)) as source:
                image_format = source.format
                if image_format not in IMAGE_FORMATS:
                    raise HTTPException(
                        status_code=415,
                        detail="Use JPEG, PNG, or WebP images only."
                    )
                if source.width * source.height > MAX_IMAGE_PIXELS:
                    raise HTTPException(
                        status_code=413,
                        detail="Images must be 25 megapixels or smaller."
                    )
                if getattr(source, "n_frames", 1) != 1:
                    raise HTTPException(
                        status_code=415,
                        detail="Animated images are not supported."
                    )
                source.verify()

            with Image.open(BytesIO(image_bytes)) as source:
                image = ImageOps.exif_transpose(source)
                has_alpha = "A" in image.getbands()
                if image_format == "JPEG":
                    image = image.convert("RGB")
                else:
                    image = image.convert("RGBA" if has_alpha else "RGB")

                output = BytesIO()
                if image_format == "JPEG":
                    image.save(output, format="JPEG", quality=90, optimize=True, progressive=True)
                elif image_format == "PNG":
                    image.save(output, format="PNG", optimize=True)
                else:
                    image.save(output, format="WEBP", quality=90, method=4)

        normalized = output.getvalue()
        if len(normalized) > MAX_IMAGE_BYTES:
            raise HTTPException(
                status_code=413,
                detail="Each processed image must be 5 MB or smaller."
            )
        content_type, extension = IMAGE_FORMATS[image_format]
        return normalized, content_type, extension
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning, ValueError):
        raise HTTPException(
            status_code=400,
            detail="One of the uploaded files is not a valid supported image."
        )


async def parse_complaint_submission(request: Request) -> tuple[ComplaintCreate, list[tuple[bytes, str, str]]]:
    content_type = request.headers.get("content-type", "").lower()

    if content_type.startswith("application/json"):
        body = await read_limited_body(request, MAX_JSON_REQUEST_BYTES)
        try:
            complaint_data = ComplaintCreate.model_validate(json.loads(body))
        except (json.JSONDecodeError, UnicodeDecodeError):
            raise HTTPException(status_code=400, detail="Invalid JSON request body.")
        except ValidationError as error:
            raise HTTPException(
                status_code=422,
                detail=[
                    {"loc": item["loc"], "msg": item["msg"], "type": item["type"]}
                    for item in error.errors()
                ]
            )
        return complaint_data, []

    if not content_type.startswith("multipart/form-data"):
        raise HTTPException(
            status_code=415,
            detail="Submit complaint data as JSON or multipart form data."
        )

    body = await read_limited_body(request, MAX_MULTIPART_REQUEST_BYTES)
    envelope = (
        f"Content-Type: {request.headers.get('content-type')}\r\n"
        "MIME-Version: 1.0\r\n\r\n"
    ).encode("ascii", errors="strict") + body
    parsed = BytesParser(policy=email_policy).parsebytes(envelope)
    if not parsed.is_multipart() or parsed.defects:
        raise HTTPException(status_code=400, detail="Invalid multipart request.")

    fields = {}
    image_parts = []
    allowed_fields = {
        "city_id", "category_id", "title", "description",
        "location_address", "latitude", "longitude", "images"
    }

    for part in parsed.iter_parts():
        field_name = part.get_param("name", header="content-disposition")
        if part.get_content_disposition() != "form-data" or not field_name:
            raise HTTPException(status_code=400, detail="Invalid multipart field.")
        if field_name not in allowed_fields:
            raise HTTPException(status_code=400, detail="Unexpected complaint field.")

        payload = part.get_payload(decode=True) or b""
        filename = part.get_filename()
        if field_name == "images":
            if not filename and not payload:
                continue
            if not filename:
                raise HTTPException(status_code=400, detail="An uploaded image is missing its filename.")
            if len(image_parts) >= MAX_COMPLAINT_IMAGES:
                raise HTTPException(status_code=413, detail="You can attach up to five images per complaint.")
            if len(payload) > MAX_IMAGE_BYTES:
                raise HTTPException(status_code=413, detail="Each image must be 5 MB or smaller.")
            if not payload:
                raise HTTPException(status_code=400, detail="An uploaded image is empty.")
            image_parts.append(normalize_uploaded_image(payload))
            continue

        if filename is not None:
            raise HTTPException(status_code=400, detail="Only image files may be uploaded.")
        if field_name in fields:
            raise HTTPException(status_code=400, detail="Complaint fields must not be repeated.")
        if len(payload) > 12 * 1024:
            raise HTTPException(status_code=413, detail="A complaint field is too large.")
        try:
            fields[field_name] = payload.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Complaint text must use UTF-8 encoding.")

    try:
        complaint_data = ComplaintCreate.model_validate(fields)
    except ValidationError as error:
        raise HTTPException(
            status_code=422,
            detail=[
                {"loc": item["loc"], "msg": item["msg"], "type": item["type"]}
                for item in error.errors()
            ]
        )
    return complaint_data, image_parts


def get_complaint_for_media_access(
    complaint_id: str,
    current_user: dict | None,
    db: Session
) -> Complaint:
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated.")

    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id
    ).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    role = current_user["role"]
    if role == "admin":
        return complaint
    if role == "citizen":
        if complaint.user_id != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="You can only view images for your own complaints.")
        return complaint
    if role == "officer":
        officer = db.query(Officer).filter(
            Officer.user_id == current_user["user_id"]
        ).first()
        if not officer or complaint.officer_id != officer.id:
            raise HTTPException(status_code=403, detail="You can only view images for complaints assigned to you.")
        return complaint

    raise HTTPException(status_code=403, detail="You are not authorized to view complaint images.")


# Create database tables
Base.metadata.create_all(
    bind=engine
)


app = FastAPI(
    title="CivicResolve API",
    description="Government Civic Issue Management System",
    version="1.0.0"
)


# Allow React frontend to communicate with FastAPI
app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


class ComplaintCreate(BaseModel):

    city_id: int

    category_id: int

    title: str = Field(
        ...,
        min_length=3,
        max_length=150
    )

    description: str = Field(
        ...,
        min_length=10,
        max_length=2000
    )

    location_address: str | None = Field(
        default=None,
        max_length=250
    )

    latitude: float | None = Field(
        default=None,
        ge=-90,
        le=90,
        allow_inf_nan=False
    )

    longitude: float | None = Field(
        default=None,
        ge=-180,
        le=180,
        allow_inf_nan=False
    )

    @field_validator("title", "description")
    @classmethod
    def validate_text(cls, value):
        value = value.strip()

        if not value:
            raise ValueError(
                "Text cannot be empty or contain only spaces."
            )

        return value

    @field_validator("location_address")
    @classmethod
    def normalize_location_address(cls, value):
        if value is None:
            return None
        value = value.strip()
        return value or None

    @model_validator(mode="after")
    def validate_coordinate_pair(self):
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("Latitude and longitude must be provided together.")
        return self


class OfficerCreate(BaseModel):

    officer_id: str

    name: str

    email: str

    password: str

    department_id: int

    city_id: int


class UserRegister(BaseModel):

    name: str

    email: str

    password: str


class UserLogin(BaseModel):

    email: str

    password: str


@app.post("/register")
def register_user(

    user_data: UserRegister,

    db: Session = Depends(get_db)

):

    existing_user = (
        db.query(User)
        .filter(
            User.email == user_data.email
        )
        .first()
    )

    if existing_user:
        return {
            "success": False,
            "message": "Email is already registered."
        }

    password_hash = pwd_context.hash(
        user_data.password
    )

    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=password_hash,
        role="citizen",
        is_active="true"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Registration successful.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


@app.post("/login")
def login_user(

    user_data: UserLogin,

    db: Session = Depends(get_db)

):

    user = (
        db.query(User)
        .filter(
            User.email == user_data.email
        )
        .first()
    )

    if not user:
        return {
            "success": False,
            "message": "Invalid email or password."
        }

    if user.is_active != "true":
        return {
            "success": False,
            "message": "Your account is inactive."
        }

    if not pwd_context.verify(
        user_data.password,
        user.password_hash
    ):
        return {
            "success": False,
            "message": "Invalid email or password."
        }

    access_token = create_access_token({
        "user_id": user.id,
        "role": user.role
    })

    return {
        "success": True,
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


@app.get("/auth/me")
def get_my_account(

    current_user: dict = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    user = (
        db.query(User)
        .filter(
            User.id == current_user["user_id"]
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return {
        "success": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


@app.get("/admin/secure-test")
def secure_admin_test(

    current_user: dict = Depends(require_admin)

):

    return {
        "success": True,
        "message": "You are authorized as admin."
    }


@app.get("/")
def home():

    return {
        "message": "CivicResolve backend is running!"
    }


@app.post("/complaints")
async def create_complaint(
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict | None = Depends(get_current_user)
):
    if current_user and current_user.get("role") != "citizen":
        raise HTTPException(
            status_code=403,
            detail="Only citizen accounts can submit complaints."
        )

    complaint, image_parts = await parse_complaint_submission(request)

    # Check city
    city = (
        db.query(City)
        .filter(
            City.id == complaint.city_id
        )
        .first()
    )

    if not city:
        raise HTTPException(
            status_code=400,
            detail="Invalid city."
        )

    # Check issue category
    category = (
        db.query(IssueCategory)
        .filter(
            IssueCategory.id == complaint.category_id
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=400,
            detail="Invalid issue category."
        )

    department_id = category.department_id

    complaint_id = (
        "CR-"
        + datetime.now().strftime(
            "%Y%m%d%H%M%S%f"
        )
    )

    # Get logged-in citizen's user ID
    user_id = None

    if current_user:
        user_id = current_user["user_id"]

    new_complaint = Complaint(
        complaint_id=complaint_id,
        city_id=complaint.city_id,
        department_id=department_id,
        category_id=complaint.category_id,
        title=complaint.title,
        description=complaint.description,
        location_address=complaint.location_address,
        latitude=complaint.latitude,
        longitude=complaint.longitude,
        status="Submitted",
        user_id=user_id
    )

    history = ComplaintHistory(
        complaint=new_complaint,
        old_status=None,
        new_status="Submitted",
        remarks="Complaint submitted by citizen.",
        changed_by="Citizen"
    )

    db.add(new_complaint)
    db.add(history)

    complaint_directory = UPLOAD_DIR / complaint_id
    saved_files = []
    created_directory = False

    try:
        if image_parts:
            complaint_directory.mkdir(parents=True, exist_ok=False)
            created_directory = True

            for image_bytes, content_type, extension in image_parts:
                storage_name = f"{secrets.token_hex(24)}{extension}"
                image_path = complaint_directory / storage_name
                saved_files.append(image_path)
                with image_path.open("xb") as image_file:
                    image_file.write(image_bytes)
                db.add(ComplaintImage(
                    complaint=new_complaint,
                    storage_name=storage_name,
                    content_type=content_type,
                    size_bytes=len(image_bytes)
                ))

        db.commit()

    except IntegrityError:
        db.rollback()
        for image_path in saved_files:
            image_path.unlink(missing_ok=True)
        if created_directory:
            complaint_directory.rmdir()

        raise HTTPException(
            status_code=500,
            detail="Failed to create complaint."
        )

    except Exception:
        db.rollback()
        for image_path in saved_files:
            image_path.unlink(missing_ok=True)
        if created_directory and complaint_directory.exists():
            complaint_directory.rmdir()
        raise

    db.refresh(new_complaint)

    return {
        "success": True,
        "complaint_id":
            new_complaint.complaint_id,
        "city":
            city.name,
        "category":
            category.name,
        "department_id":
            department_id,
        "message":
            "Complaint submitted successfully!",
        "status":
            new_complaint.status,
        "image_count":
            len(image_parts)
    }


@app.get("/complaints/{complaint_id}/images")
def get_complaint_images(
    complaint_id: str,
    current_user: dict | None = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = get_complaint_for_media_access(complaint_id, current_user, db)
    return [
        {
            "id": image.id,
            "content_type": image.content_type,
            "size_bytes": image.size_bytes,
            "url": f"/complaints/{complaint_id}/images/{image.id}"
        }
        for image in complaint.images
    ]


@app.get("/complaints/{complaint_id}/images/{image_id}")
def get_complaint_image(
    complaint_id: str,
    image_id: int,
    current_user: dict | None = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = get_complaint_for_media_access(complaint_id, current_user, db)
    image = db.query(ComplaintImage).filter(
        ComplaintImage.id == image_id,
        ComplaintImage.complaint_id == complaint.id
    ).first()
    if not image or Path(image.storage_name).name != image.storage_name:
        raise HTTPException(status_code=404, detail="Complaint image not found.")

    extension = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    }.get(image.content_type)
    if not extension:
        raise HTTPException(status_code=404, detail="Complaint image not found.")

    image_path = UPLOAD_DIR / complaint.complaint_id / image.storage_name
    if not image_path.is_file():
        raise HTTPException(status_code=404, detail="Complaint image file not found.")

    return FileResponse(
        image_path,
        media_type=image.content_type,
        headers={
            "Content-Disposition": f'inline; filename="complaint-image{extension}"',
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff"
        }
    )


@app.get("/complaints")
def get_complaints(

    db: Session = Depends(get_db)

):

    complaints = (
        db.query(Complaint)
        .all()
    )


    return complaints

@app.get("/cities")
def get_cities(
    db: Session = Depends(get_db)
):

    cities = (
        db.query(City)
        .filter(City.is_active == "true")
        .all()
    )

    return cities



class CityCreate(BaseModel):

    name: str

    state: str



@app.post("/cities")
def create_city(

    city: CityCreate,

    db: Session = Depends(get_db)

):

    existing_city = (
        db.query(City)
        .filter(City.name == city.name)
        .first()
    )

    if existing_city:

        raise HTTPException(
            status_code=409,
            detail=f"City '{city.name}' already exists."
        )

    new_city = City(

        name=city.name,

        state=city.state,

        is_active="true"

    )

    db.add(new_city)

    try:

        db.commit()

    except IntegrityError:

        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=f"City '{city.name}' already exists."
        )

    db.refresh(new_city)

    return {

        "success": True,

        "city": new_city

    }

@app.get("/departments")
def get_departments(

    db: Session = Depends(get_db)

):

    departments = (
        db.query(Department)
        .filter(
            Department.is_active == "true"
        )
        .all()
    )

    return departments

@app.get("/categories")
def get_categories(

    db: Session = Depends(get_db)

):

    categories = (
        db.query(IssueCategory)
        .filter(
            IssueCategory.is_active == "true"
        )
        .all()
    )

    return categories


@app.get("/complaints/{complaint_id}")
def get_complaint(
    complaint_id: str,
    db: Session = Depends(get_db)
):

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.complaint_id == complaint_id
        )
        .first()
    )

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found."
        )

    return {
        "success": True,

        "complaint_id":
            complaint.complaint_id,

        "city":
            complaint.city.name,

        "city_id":
            complaint.city_id,

        "category":
            complaint.category.name,

        "category_id":
            complaint.category_id,

        "department":
            complaint.department.name,

        "department_id":
            complaint.department_id,

        "officer":
            complaint.officer.name
            if complaint.officer
            else None,

        "officer_id":
            complaint.officer.officer_id
            if complaint.officer
            else None,

        "title":
            complaint.title,

        "description":
            complaint.description,

        "location_address":
            complaint.location_address,

        "latitude":
            complaint.latitude,

        "longitude":
            complaint.longitude,

        "status":
            complaint.status,

        "created_at":
            complaint.created_at
    }


class StatusUpdate(BaseModel):

    status: str

    remarks: str | None = None


@app.put("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: str,
    status_update: StatusUpdate,
    current_user: dict = Depends(require_officer),
    db: Session = Depends(get_db)
):
    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.complaint_id == complaint_id
        )
        .first()
    )

    if not complaint:
        return {
            "success": False,
            "message": "Complaint not found."
        }

    officer = (
        db.query(Officer)
        .filter(
            Officer.user_id == current_user["user_id"]
        )
        .first()
    )

    if not officer:
        raise HTTPException(
            status_code=403,
            detail="Officer profile not found."
        )

    if complaint.officer_id != officer.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update complaints assigned to you."
        )

    allowed_statuses = [
        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved",
        "Rejected"
    ]

    if status_update.status not in allowed_statuses:
        return {
            "success": False,
            "message": "Invalid complaint status."
        }

    old_status = complaint.status
    new_status = status_update.status

    if old_status == new_status:
        raise HTTPException(
            status_code=400,
            detail="Complaint is already in this status."
        )

    complaint.status = new_status

    remarks = (
        status_update.remarks
        if status_update.remarks
        else
        f"Complaint status changed from {old_status} to {new_status}."
    )

    history = ComplaintHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status=new_status,
        remarks=remarks,
        changed_by=officer.name
    )

    db.add(history)
    db.commit()
    db.refresh(complaint)

    return {
        "success": True,
        "message": "Complaint updated successfully.",
        "complaint_id": complaint.complaint_id,
        "status": complaint.status,
        "remarks": remarks
    }


@app.get("/complaints/{complaint_id}/history")
def get_complaint_history(

    complaint_id: str,

    db: Session = Depends(get_db)

):

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.complaint_id ==
            complaint_id
        )
        .first()
    )


    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found."
        )


    history = sorted(
        complaint.history,
        key=lambda item: item.created_at
    )


    return {

        "success": True,

        "history": [

            {

                "old_status":
                    item.old_status,

                "new_status":
                    item.new_status,

                "remarks":
                    item.remarks,

                "created_at":
                    item.created_at

            }

            for item in history

        ]

    }


@app.get("/citizen/complaints")
def get_my_complaints(
    current_user: dict | None = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated."
        )

    if current_user["role"] != "citizen":
        raise HTTPException(
            status_code=403,
            detail="Citizen access required."
        )

    complaints = (
        db.query(Complaint)
        .filter(
            Complaint.user_id == current_user["user_id"]
        )
        .order_by(
            Complaint.created_at.desc()
        )
        .all()
    )

    return [
        {
            "complaint_id": complaint.complaint_id,
            "title": complaint.title,
            "description": complaint.description,
            "location_address": complaint.location_address,
            "latitude": complaint.latitude,
            "longitude": complaint.longitude,
            "status": complaint.status,
            "city": complaint.city.name,
            "category": complaint.category.name,
            "department": complaint.department.name,
            "officer": (
                complaint.officer.name
                if complaint.officer
                else None
            ),
            "created_at": complaint.created_at
        }
        for complaint in complaints
    ]


@app.get("/officers")
def get_officers(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):

    officers = (
        db.query(Officer)
        .all()
    )

    return [
        {
            "id": officer.id,
            "officer_id": officer.officer_id,
            "name": officer.name,
            "email": officer.email,
            "department_id": officer.department_id,
            "city_id": officer.city_id,
            "is_active": officer.is_active
        }

        for officer in officers
    ]


@app.get("/officers/me")
def get_my_officer_profile(
    current_user: dict = Depends(require_officer),
    db: Session = Depends(get_db)
):
    officer = (
        db.query(Officer)
        .filter(Officer.user_id == current_user["user_id"])
        .first()
    )

    if not officer:
        raise HTTPException(
            status_code=404,
            detail="Officer profile not found."
        )

    return {
        "success": True,
        "officer": {
            "id": officer.id,
            "officer_id": officer.officer_id,
            "name": officer.name,
            "email": officer.email,
            "department_id": officer.department_id,
            "city_id": officer.city_id,
            "is_active": officer.is_active
        }
    }


@app.post("/officers")
def create_officer(

    officer_data: OfficerCreate,

    current_user: dict = Depends(require_admin),

    db: Session = Depends(get_db)

):

    # Check whether the Officer ID already exists
    existing_officer = (
        db.query(Officer)
        .filter(
            Officer.officer_id == officer_data.officer_id
        )
        .first()
    )

    if existing_officer:
        return {
            "success": False,
            "message": "Officer ID already exists."
        }

    # Check whether the email already belongs to a User
    existing_user = (
        db.query(User)
        .filter(
            User.email == officer_data.email
        )
        .first()
    )

    if existing_user:
        return {
            "success": False,
            "message": "Email already exists."
        }

    # Check department
    department = (
        db.query(Department)
        .filter(
            Department.id == officer_data.department_id
        )
        .first()
    )

    if not department:
        return {
            "success": False,
            "message": "Department not found."
        }

    # Check city
    city = (
        db.query(City)
        .filter(
            City.id == officer_data.city_id
        )
        .first()
    )

    if not city:
        return {
            "success": False,
            "message": "City not found."
        }

    # Hash the officer's password
    hashed_password = pwd_context.hash(
        officer_data.password
    )

    # Create User account
    user = User(
        name=officer_data.name,
        email=officer_data.email,
        password_hash=hashed_password,
        role="officer",
        is_active="true"
    )

    db.add(user)
    db.flush()

    # Create Officer profile linked to User
    officer = Officer(
        officer_id=officer_data.officer_id,
        name=officer_data.name,
        email=officer_data.email,
        user_id=user.id,
        department_id=officer_data.department_id,
        city_id=officer_data.city_id,
        is_active="true"
    )

    db.add(officer)

    try:
        db.commit()
        db.refresh(user)
        db.refresh(officer)

    except Exception:
        db.rollback()

        return {
            "success": False,
            "message": "Unable to create officer account."
        }

    return {
        "success": True,
        "message": "Officer account created successfully.",
        "officer": {
            "id": officer.id,
            "officer_id": officer.officer_id,
            "name": officer.name,
            "email": officer.email,
            "department_id": officer.department_id,
            "city_id": officer.city_id,
            "is_active": officer.is_active,
            "user_id": officer.user_id
        }
    }


@app.put("/officers/{officer_id}/status")
def update_officer_status(

    officer_id: str,

    current_user: dict = Depends(require_admin),

    db: Session = Depends(get_db)

):

    officer = (
        db.query(Officer)
        .filter(
            Officer.officer_id == officer_id
        )
        .first()
    )

    if not officer:
        raise HTTPException(
            status_code=404,
            detail="Officer not found."
        )

    if officer.is_active == "true":
        new_status = "false"
    else:
        new_status = "true"

    officer.is_active = new_status

    if officer.user_id:
        user = (
            db.query(User)
            .filter(
                User.id == officer.user_id
            )
            .first()
        )

        if user:
            user.is_active = new_status

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to update officer status."
        )

    db.refresh(officer)

    return {
        "success": True,
        "message": (
            "Officer activated successfully."
            if officer.is_active == "true"
            else "Officer deactivated successfully."
        ),
        "is_active": officer.is_active
    }


class OfficerAssignment(BaseModel):
    officer_id: int


@app.put("/complaints/{complaint_id}/assign")
def assign_officer(
    complaint_id: str,
    assignment: OfficerAssignment,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.complaint_id == complaint_id
        )
        .first()
    )

    if not complaint:
        return {
            "success": False,
            "message": "Complaint not found."
        }

    officer = (
        db.query(Officer)
        .filter(
            Officer.id == assignment.officer_id,
            Officer.is_active == "true"
        )
        .first()
    )

    if not officer:
        return {
            "success": False,
            "message": "Officer not found."
        }

    if officer.department_id != complaint.department_id:
        return {
            "success": False,
            "message":
                "Officer does not belong to this department."
        }

    if officer.city_id != complaint.city_id:
        return {
            "success": False,
            "message":
                "Officer does not belong to this city."
        }

    complaint.officer_id = officer.id

    old_status = complaint.status

    complaint.status = "Assigned"

    history = ComplaintHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status="Assigned",
        remarks=f"Complaint assigned to {officer.name}.",
        changed_by=officer.name
    )

    db.add(history)

    db.commit()

    db.refresh(complaint)

    return {
        "success": True,
        "message": "Officer assigned successfully.",
        "complaint_id": complaint.complaint_id,
        "officer_id": officer.officer_id,
        "officer_name": officer.name,
        "status": complaint.status
    }


@app.get("/officers/{officer_id}/complaints")
def get_officer_complaints(
    officer_id: int,
    current_user: dict = Depends(require_officer),
    db: Session = Depends(get_db)
):
    officer = (
        db.query(Officer)
        .filter(Officer.id == officer_id)
        .first()
    )

    if not officer:
        raise HTTPException(
            status_code=404,
            detail="Officer not found."
        )

    if officer.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own complaints."
        )

    complaints = (
        db.query(Complaint)
        .filter(Complaint.officer_id == officer.id)
        .order_by(Complaint.created_at.desc())
        .all()
    )

    return [
        {
            "complaint_id": complaint.complaint_id,
            "title": complaint.title,
            "description": complaint.description,
            "location_address": complaint.location_address,
            "latitude": complaint.latitude,
            "longitude": complaint.longitude,
            "status": complaint.status,
            "city": complaint.city.name,
            "category": complaint.category.name,
            "department": complaint.department.name,
            "created_at": complaint.created_at
        }
        for complaint in complaints
    ]


@app.get("/admin/statistics")
def get_admin_statistics(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):

    total = db.query(Complaint).count()

    submitted = (
        db.query(Complaint)
        .filter(
            Complaint.status == "Submitted"
        )
        .count()
    )

    under_review = (
        db.query(Complaint)
        .filter(
            Complaint.status == "Under Review"
        )
        .count()
    )

    assigned = (
        db.query(Complaint)
        .filter(
            Complaint.status == "Assigned"
        )
        .count()
    )

    in_progress = (
        db.query(Complaint)
        .filter(
            Complaint.status == "In Progress"
        )
        .count()
    )

    resolved = (
        db.query(Complaint)
        .filter(
            Complaint.status == "Resolved"
        )
        .count()
    )

    rejected = (
        db.query(Complaint)
        .filter(
            Complaint.status == "Rejected"
        )
        .count()
    )

    return {

        "success": True,

        "statistics": {

            "total": total,

            "submitted": submitted,

            "under_review": under_review,

            "assigned": assigned,

            "in_progress": in_progress,

            "resolved": resolved,

            "rejected": rejected

        }

    }


@app.get("/admin/complaints")
def get_admin_complaints(

    city_id: int | None = None,

    department_id: int | None = None,

    status: str | None = None,

    category_id: int | None = None,

    current_user: dict = Depends(require_admin),

    db: Session = Depends(get_db)

):

    query = db.query(Complaint)

    if city_id is not None:

        query = query.filter(
            Complaint.city_id == city_id
        )

    if department_id is not None:

        query = query.filter(
            Complaint.department_id ==
            department_id
        )

    if status is not None:

        query = query.filter(
            Complaint.status == status
        )

    if category_id is not None:

        query = query.filter(
            Complaint.category_id ==
            category_id
        )

    complaints = (
        query
        .order_by(
            Complaint.created_at.desc()
        )
        .all()
    )

    return {

        "success": True,

        "complaints": [

            {

                "id": complaint.id,

                "complaint_id":
                    complaint.complaint_id,

                "title":
                    complaint.title,

                "status":
                    complaint.status,

                "location_address":
                    complaint.location_address,

                "latitude":
                    complaint.latitude,

                "longitude":
                    complaint.longitude,

                "city":
                    complaint.city.name,

                "category":
                    complaint.category.name,

                "department":
                    complaint.department.name,

                "officer":
                    complaint.officer.name
                    if complaint.officer
                    else None,

                "created_at":
                    complaint.created_at

            }

            for complaint in complaints

        ]

    }


@app.get("/cities")
def get_cities(
    db: Session = Depends(get_db)
):

    cities = (
        db.query(City)
        .order_by(City.name)
        .all()
    )

    return [

        {
            "id": city.id,
            "name": city.name
        }

        for city in cities

    ]


@app.get("/departments")
def get_departments(
    db: Session = Depends(get_db)
):

    departments = (
        db.query(Department)
        .order_by(Department.name)
        .all()
    )

    return [

        {
            "id": department.id,
            "name": department.name
        }

        for department in departments

    ]


@app.get("/categories")
def get_categories(
    db: Session = Depends(get_db)
):

    categories = (
        db.query(IssueCategory)
        .order_by(IssueCategory.name)
        .all()
    )

    return [

        {
            "id": category.id,
            "name": category.name
        }

        for category in categories

    ]


@app.get("/admin/city-statistics")
def get_city_statistics(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):

    cities = (
        db.query(City)
        .order_by(City.name)
        .all()
    )

    result = []

    for city in cities:

        total = (
            db.query(Complaint)
            .filter(
                Complaint.city_id == city.id
            )
            .count()
        )

        resolved = (
            db.query(Complaint)
            .filter(
                Complaint.city_id == city.id,
                Complaint.status == "Resolved"
            )
            .count()
        )

        pending = (
            db.query(Complaint)
            .filter(
                Complaint.city_id == city.id,
                Complaint.status != "Resolved"
            )
            .count()
        )

        resolution_rate = (
            (resolved / total) * 100
            if total > 0
            else 0
        )

        result.append({

            "city_id": city.id,

            "city": city.name,

            "total": total,

            "pending": pending,

            "resolved": resolved,

            "resolution_rate":
                round(resolution_rate, 2)

        })

    return {

        "success": True,

        "cities": result

    }


@app.get("/admin/department-statistics")
def get_department_statistics(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):

    departments = (
        db.query(Department)
        .order_by(Department.name)
        .all()
    )

    result = []

    for department in departments:

        total = (
            db.query(Complaint)
            .filter(
                Complaint.department_id ==
                department.id
            )
            .count()
        )

        resolved = (
            db.query(Complaint)
            .filter(
                Complaint.department_id ==
                department.id,

                Complaint.status ==
                "Resolved"
            )
            .count()
        )

        pending = (
            db.query(Complaint)
            .filter(
                Complaint.department_id ==
                department.id,

                Complaint.status !=
                "Resolved"
            )
            .count()
        )

        result.append({

            "department_id":
                department.id,

            "department":
                department.name,

            "total":
                total,

            "pending":
                pending,

            "resolved":
                resolved

        })

    return {

        "success": True,

        "departments":
            result

    }
