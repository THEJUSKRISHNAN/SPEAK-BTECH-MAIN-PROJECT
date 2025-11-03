from flask import Blueprint, request, jsonify
from extensions import mongo, bcrypt
import jwt
import datetime
from flask import current_app

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if (not data or 'email' not in data or 'password' not in data or 'name' not in data or
            'isDeaf' not in data):
        return jsonify({'message': 'Missing name, email, password, or isDeaf status'}), 400

    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    is_deaf = data.get('isDeaf')
    
    if not isinstance(is_deaf, bool):
        return jsonify({'message': 'isDeaf field must be a boolean (true or false)'}), 400

    
    if mongo.cx['speak_db'].users.find_one({'email': email}):
        return jsonify({'message': 'User already exists'}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    
    mongo.cx['speak_db'].users.insert_one({
        'name': name,
        'email': email,
        'password': hashed_password,
        'isDeaf': is_deaf,
        'profile_image_url': None
    })
    
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing email or password'}), 400

    email = data.get('email')
    password = data.get('password')
    
    
    user = mongo.cx['speak_db'].users.find_one({'email': email})
    
    if user and bcrypt.check_password_hash(user['password'], password):
        token = jwt.encode({
            'user_id': str(user['_id']),
            'name': user.get('name'),
            'email': user['email'],
            'isDeaf': user.get('isDeaf'),
            'profile_image_url':user.get('profile_image_url'),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({'token': token}), 200
    else:
        return jsonify({'message': 'Invalid email or password'}), 401