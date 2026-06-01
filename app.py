from flask import Flask, request, jsonify, session, redirect, render_template
from flask_cors import CORS
import pyodbc
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "super_secret_key"
CORS(app)

# SQL connection
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};'   # or 18 if installed
    'SERVER=localhost;'                         # or localhost\\SEADEV1 if needed
    'DATABASE=TestDB;'
    'Trusted_Connection=yes;'
)
cursor = conn.cursor()

# Routes
@app.route("/users", methods=["GET"]) 
def get_users(): 
    cursor.execute("SELECT id, username, email, password_hash FROM Users") 
    rows = cursor.fetchall() 
    users = [{"id": row[0], "username": row[1], "email": row[2], "password_hash": row[3]} for row in rows] 
    return jsonify(users)

@app.route("/add_user", methods=["POST", "GET"])
def add_user():
    try:
        data = request.json

        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        password_hash = data.get("password", "")  # hash later, raw for now

        if not username or not email or not password_hash:
            return jsonify({
                "success": False,
                "message": "Enter something please"
            }), 400

        if "@" not in email:
            return jsonify({
                "success": False,
                "message": "Invalid email"
            }), 400

        if len(password_hash) < 8:
            return jsonify({
                "success": False,
                "message": "Password must be at least 8 characters long"
            }), 400

        hashed_pw = generate_password_hash(password_hash)

        cursor = conn.cursor()

        # Check if username exists
        cursor.execute(
            "SELECT 1 FROM Users WHERE username = ?",
            (username,)
        )
        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Username already exists"
            }), 400
        
        cursor.execute(
            "SELECT 1 FROM Users WHERE email = ?",
            (email,)
        )
        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Email already exists"
            }), 400

        cursor.execute("""
            INSERT INTO Users (username, email, password_hash)
            OUTPUT INSERTED.id
            VALUES (?, ?, ?)
        """, (username, email, hashed_pw))

        user_id = cursor.fetchone()[0]

        session["user_id"] = user_id
        session["gooner"] = username
        session["nicemail"] = email


        conn.commit()
        return jsonify({
                "success": True,
                "message": "User added successfully!"
            }), 201

    except Exception as e:
        # guarantee return on error
        print("ERROR:", e)
        return jsonify({
            "success": False,
            "message": "server error"
        }), 500

@app.route("/login", methods=["POST", "GET"])
def login():
    try:
        data = request.get_json()

        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return jsonify({
                "success": False,
                "message": "Username and password required"
            }), 400

        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, username, email, password_hash
            FROM Users
            WHERE username = ?
        """, (username,))

        user = cursor.fetchone()

        if user and check_password_hash(user[3], password):
            session["user_id"] = user[0]   # only store id

            return jsonify({
                "success": True,
                "message": "Login successful"
            })

        return jsonify({
            "success": False,
            "message": "Invalid username or password"
        }), 401

    except Exception as e:
        print("ERROR:", e)
        return jsonify({
            "success": False,
            "message": "Server error"
        }), 500
    
@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM Users WHERE id = ?", (user_id,))
            
            if user_id == None:
                return jsonify({
                    "success": False,
                    "message": "Just enter something please god"
                }), 400

            if cursor.rowcount == 0:
                return jsonify({
                    "success": False,
                    "message": "User not found"
                }), 404

            conn.commit()
            return jsonify({
                "success": True,
                "message": "User deleted"
            }), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({
            "success": False,
            "message": "Server error"
        }), 500
    
@app.route("/signup", methods=["GET"])
def signup():
    return render_template("signup.html")

@app.route("/me", methods=["GET"])
def me():

    if "user_id" not in session:
        return jsonify({"logged_in": False})

    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, username, email
        FROM Users
        WHERE id = ?
    """, (session["user_id"],))

    user = cursor.fetchone()

    if not user:
        return jsonify({"logged_in": False})

    return jsonify({
        "logged_in": True,
        "user_id": user[0],
        "username": user[1],
        "email": user[2]
    })

@app.route("/userindex", methods=["GET"])
def userindex():
    if "user_id" not in session:
        return redirect("/add_user")  # or "/login"
    return render_template("userindex.html")

@app.route("/")
def index():
    return render_template("main.html")

@app.route("/loginpage")
def login_page():
    return render_template("Login.html")

@app.route("/signuppage")
def signup_page():
    return render_template("Sign up.html")

@app.route("/aboutpage")
def about_page():
    return render_template("about.html")

@app.route("/devpage")
def dev_page():
    return render_template("dev.html")

@app.route("/homepage")
def homepage():
    return render_template("homepage.html")

@app.route("/logout")
def logout():
    session.clear()
    return render_template("main.html")

@app.route("/profile")
def profile():
    return render_template("profile.html")

# -----------------------------
# App entry point
# -----------------------------
if __name__ == "__main__":
    app.run(port=5000, debug=True)
