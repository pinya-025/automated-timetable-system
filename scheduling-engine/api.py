"""
FastAPI Microservice for OR-Tools CP-SAT Timetable Scheduling Engine
Endpoints called by Laravel Backend
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from models import ScheduleInputPayload, ScheduleOutputResponse
from solver import TimetableCPSATSolver

app = FastAPI(
    title="Academic Timetable Optimization API (Google OR-Tools CP-SAT)",
    description="Dedicated microservice for high-performance constraint programming timetable scheduling",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "engine": "Google OR-Tools CP-SAT", "version": "9.8"}


@app.post(
    "/api/v1/optimize-schedule",
    response_model=ScheduleOutputResponse,
    status_code=status.HTTP_200_OK
)
def optimize_schedule(payload: ScheduleInputPayload):
    try:
        solver = TimetableCPSATSolver(payload)
        result = solver.solve()
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scheduling optimization failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8001, reload=True)
