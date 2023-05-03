local:
	uvicorn congenial-system-server.server:app --host 0.0.0.0 --port 8000 --workers 2 --reload