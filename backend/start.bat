@echo off
IF NOT EXIST venv (
    python -m venv venv
)
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install --no-cache-dir Flask-Limiter==1.4
pip install --no-cache-dir limits==1.5
pip uninstall bcrypt -y
pip install python-bcrypt
pip install -r requirements.txt
python init_db.py
set FLASK_APP=app.py
set FLASK_ENV=development
flask run 